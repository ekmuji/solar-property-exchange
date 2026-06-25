import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ChargerStatus, ChargingSessionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EvGateway } from './ev.gateway';
import { ReserveChargerDto, CompleteSessionDto } from './dto/ev.dto';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private gateway: EvGateway,
  ) {}

  async reserve(chargerId: string, userId: string, dto: ReserveChargerDto) {
    const charger = await this.prisma.evCharger.findUnique({ where: { id: chargerId } });
    if (!charger) throw new NotFoundException('Charger not found');
    if (charger.status !== ChargerStatus.AVAILABLE) {
      throw new BadRequestException(`Charger is currently ${charger.status.toLowerCase()}`);
    }

    const [session] = await this.prisma.$transaction([
      this.prisma.chargingSession.create({
        data: {
          userId,
          chargerId,
          status: ChargingSessionStatus.RESERVED,
          reservedStart: new Date(dto.startTime),
          reservedDuration: dto.durationMinutes,
        },
      }),
      this.prisma.evCharger.update({ where: { id: chargerId }, data: { status: ChargerStatus.RESERVED } }),
    ]);

    this.gateway.broadcastChargerStatus(charger.warehouseId, { chargerId, status: 'RESERVED' });
    return session;
  }

  async start(sessionId: string) {
    const session = await this.prisma.chargingSession.findUnique({ where: { id: sessionId }, include: { charger: true } });
    if (!session) throw new NotFoundException('Session not found');

    await this.prisma.$transaction([
      this.prisma.chargingSession.update({
        where: { id: sessionId },
        data: { status: ChargingSessionStatus.ACTIVE, startedAt: new Date() },
      }),
      this.prisma.evCharger.update({ where: { id: session.chargerId }, data: { status: ChargerStatus.OCCUPIED } }),
    ]);

    this.gateway.broadcastChargerStatus(session.charger.warehouseId, { chargerId: session.chargerId, status: 'OCCUPIED' });
    return this.prisma.chargingSession.findUnique({ where: { id: sessionId } });
  }

  /**
   * Completes a session, calculating cost from energy delivered x charger
   * price/kWh (the charger's price already reflects the site's blended
   * solar/grid rate — see ChargersService.discover). Frees the charger so
   * it reappears as AVAILABLE for the next driver immediately.
   */
  async complete(sessionId: string, dto: CompleteSessionDto) {
    const session = await this.prisma.chargingSession.findUnique({ where: { id: sessionId }, include: { charger: true } });
    if (!session) throw new NotFoundException('Session not found');

    const cost = dto.energyDeliveredKwh * Number(session.charger.pricePerKwh);

    const [updated] = await this.prisma.$transaction([
      this.prisma.chargingSession.update({
        where: { id: sessionId },
        data: {
          status: ChargingSessionStatus.COMPLETED,
          energyDeliveredKwh: dto.energyDeliveredKwh,
          cost,
          endedAt: new Date(),
        },
      }),
      this.prisma.evCharger.update({ where: { id: session.chargerId }, data: { status: ChargerStatus.AVAILABLE } }),
    ]);

    this.gateway.broadcastChargerStatus(session.charger.warehouseId, { chargerId: session.chargerId, status: 'AVAILABLE' });
    return updated;
  }

  history(userId: string) {
    return this.prisma.chargingSession.findMany({
      where: { userId },
      include: { charger: { include: { warehouse: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
