import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAgendaDto } from './dto/list-agenda.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  create = async (
    clientId: number,
    createAppointmentDto: CreateAppointmentDto,
  ) => {
    const { availabilityId } = createAppointmentDto;

    const client = await this.prismaService.user.findUnique({
      where: { id: clientId },
    });

    if (!client) throw new NotFoundException('Usuário não encontrado');

    if (client.role !== 'CLIENT') {
      throw new BadRequestException('Apenas clientes podem agendar consultas');
    }

    // buscar o slot disponível
    const availability = await this.prismaService.availability.findUnique({
      where: { id: availabilityId },
      include: {
        appointment: true,
        nutritionist: true,
      },
    });

    if (!availability) throw new NotFoundException('Horário não encontrado');

    // Se o slot já foi marcado OU já existe um agendamento ligado a ele
    if (availability.isBooked || availability.appointment) {
      throw new BadRequestException('Horário já está reservado');
    }

    // transaction faz com que as duas operações abaixo funcionem juntas de uma vez
    const appointment = await this.prismaService.$transaction(async (tx) => {
      const createdAppointment = await tx.appointment.create({
        data: {
          clientId,
          availabilityId,
        },
      });

      await tx.availability.update({
        where: { id: availabilityId },
        data: {
          isBooked: true,
        },
      });

      return createdAppointment;
    });

    const clientName = client.name ?? 'Client';

    await this.mailService.sendNutritionistAppointmentScheduled({
      to: availability.nutritionist.email,
      clientName: clientName,
      date: availability.date.toLocaleDateString('pt-BR'),
      startTime: availability.startTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      endTime: availability.endTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    await this.mailService.sendAppointmentScheduled({
      to: client.email,
      name: clientName,
      date: availability.date.toLocaleDateString('pt-BR'),
      startTime: availability.startTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      endTime: availability.endTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    return {
      message: 'Consulta agendada com sucesso',
      appointment,
    };
  };

  listByClient = async (clientId: number) => {
    const appointments = await this.prismaService.appointment.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        availability: {
          select: {
            date: true,
            startTime: true,
            endTime: true,
            nutritionist: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return appointments;
  };

  listNutritionistAgenda = async (
    nutritionistId: number,
    filters: ListAgendaDto,
  ) => {
    const { date, startDate, endDate, page = 1, limit = 10 } = filters;

    // sempre buscar apenas a agenda desse nutricionista (WHERE nutritionist_id = ?)
    const where: any = {
      nutritionistId,
    };

    if (date) {
      where.date = new Date(date);
    }

    // WHERE nutritionist_id = 1
    //AND date BETWEEN '2025-01-01' AND '2025-01-31'
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.availability.findMany({
        where,
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        skip,
        take: limit,
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          isBooked: true,
          appointment: {
            select: {
              id: true,
              status: true,
              client: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prismaService.availability.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  confirmAppointment = async (
    appointmentId: number,
    nutritionistId: number,
  ) => {
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        availability: {
          include: {
            nutritionist: true,
          },
        },
        client: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Horário não encontrado');
    }

    if (appointment.availability.nutritionistId !== nutritionistId) {
      throw new ForbiddenException('Você não pode confirmar essa consulta');
    }

    if (appointment.status !== 'SCHEDULED') {
      throw new BadRequestException('A consulta não pode ser confirmada');
    }

    await this.prismaService.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'COMPLETED',
      },
    });

    const clientName = appointment.client.name ?? 'Cliente';

    await this.mailService.sendAppointmentConfirm({
      to: appointment.client.email,
      name: clientName,
      date: appointment.availability.date.toLocaleDateString('pt-BR'),
      startTime: appointment.availability.startTime.toLocaleTimeString(
        'pt-BR',
        { hour: '2-digit', minute: '2-digit' },
      ),
      endTime: appointment.availability.endTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    return {
      message: 'Consulta confirmada com sucesso',
    };
  };

  cancelAppointment = async (appointmentId: number, clientId: number) => {
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        availability: {
          select: {
            date: true,
            startTime: true,
            endTime: true,
            
            nutritionist: true,
          }
        },
        client: true,
      },
    });

    if (!appointment) throw new NotFoundException('Horário não encontrado');

    if (appointment.clientId !== clientId)
      throw new ForbiddenException('Você não pode cancelar essa consulta');

    if (appointment.status !== 'SCHEDULED')
      throw new BadRequestException('A consulta não pode ser cancelada');

    await this.prismaService.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CANCELED',
        },
      });

      await tx.availability.update({
        where: { id: appointment.availabilityId },
        data: {
          isBooked: false,
        },
      });
    });

    const clientName = appointment.client.name ?? 'Cliente';

    await this.mailService.sendNutritionistAppointmentCanceled({
      to: appointment.availability.nutritionist.email,
      clientName: clientName,
      date: appointment.availability.date.toLocaleDateString('pt-BR'),
      startTime: appointment.availability.startTime.toLocaleTimeString(
        'pt-BR',
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      ),
      endTime: appointment.availability.endTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    await this.mailService.sendAppointmentCancel({
      to: appointment.client.email,
      name: clientName,
      date: appointment.availability.date.toLocaleDateString('pt-BR'),
      startTime: appointment.availability.startTime.toLocaleTimeString(
        'pt-BR',
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      ),
      endTime: appointment.availability.endTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    return {
      message: 'Consulta cancelada com sucesso',
    };
  };
}
