import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  imports: [PrismaModule, MailModule],
})
export class AppointmentsModule {}
