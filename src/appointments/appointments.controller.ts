import {
  ParseIntPipe,
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ListAgendaDto } from './dto/list-agenda.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Post()
  createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req,
  ) {
    const clientId = req.user.id;
    return this.appointmentsService.create(clientId, createAppointmentDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Get('my')
  listMyAppointments(@Req() req) {
    const clientId = req.user.id;
    return this.appointmentsService.listByClient(clientId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NUTRITIONIST')
  @Get('nutritionist/agenda')
  listAgenda(@Req() req, @Query() query: ListAgendaDto) {
    const nutritionistId = req.user.id;
    return this.appointmentsService.listNutritionistAgenda(nutritionistId, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NUTRITIONIST')
  @Patch(':id/confirm')
  confirmAppointment(
    @Param('id', ParseIntPipe) appointmentId: number,
    @Req() req,
  ) {
    const nutritionistId = req.user.id;
    return this.appointmentsService.confirmAppointment(
      appointmentId,
      nutritionistId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Patch(':id/cancel')
  cancelAppointment(
    @Param('id', ParseIntPipe) appointmentId: number,
    @Req() req,
  ) {
    const clientId = req.user.id;
    return this.appointmentsService.cancelAppointment(appointmentId, clientId);
  }
}
