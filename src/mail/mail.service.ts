import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`E-mail enviado para ${to}`);
    } catch (error) {
      this.logger.error('Erro ao enviar e-mail', error);
    }
  }

  async sendAppointmentScheduled(params: {
    to: string;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    const { to, name, date, startTime, endTime } = params;

    const subject = 'Consulta agendada com sucesso';

    const text = `
Olá, ${name}!

Sua consulta foi agendada com sucesso.

📅 Data: ${date}
⏰ Horário: ${startTime} às ${endTime}

Nos vemos em breve!

Equipe Agenda
`;

    const html = `
<div style="font-family: Arial, sans-serif; line-height: 1.6">
  <h2>Consulta agendada com sucesso ✅</h2>

  <p>Olá, <strong>${name}</strong>!</p>

  <p>Sua consulta foi agendada com sucesso. Confira os detalhes abaixo:</p>

  <ul>
    <li><strong>📅 Data:</strong> ${date}</li>
    <li><strong>⏰ Horário:</strong> ${startTime} às ${endTime}</li>
  </ul>

  <p>Se precisar cancelar ou alterar, faça isso pela plataforma.</p>

  <p style="margin-top: 24px">
    Atenciosamente,<br />
    <strong>Equipe Agenda</strong>
  </p>
</div>
`;

    await this.sendMail(to, subject, text, html);
  }

  async sendAppointmentConfirm(params: {
    to: string;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    const { to, name, date, startTime, endTime } = params;

    const subject = 'Consulta confirmada';

    const text = `
Olá, ${name}!

Sua consulta foi confirmada com sucesso.

📅 Data: ${date}
⏰ Horário: ${startTime} às ${endTime}

Atenciosamente,
Equipe Agenda
`;

    const html = `
<div style="font-family: Arial, sans-serif; line-height: 1.6">
  <h2>Consulta confirmada ✅</h2>

  <p>Olá, <strong>${name}</strong>!</p>

  <p>Sua consulta foi confirmada com sucesso.</p>

  <ul>
    <li><strong>📅 Data:</strong> ${date}</li>
    <li><strong>⏰ Horário:</strong> ${startTime} às ${endTime}</li>
  </ul>

  <p style="margin-top: 24px">
    Atenciosamente,<br />
    <strong>Equipe Agenda</strong>
  </p>
</div>
`;

    await this.sendMail(to, subject, text, html);
  }

  async sendAppointmentCancel(params: {
    to: string;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    const { to, name, date, startTime, endTime } = params;

    const subject = 'Consulta cancelada';

    const text = `
Olá, ${name}!

Sua consulta foi cancelada.

📅 Data: ${date}
⏰ Horário: ${startTime} às ${endTime}

Você pode reagendar uma nova consulta pela plataforma.

Atenciosamente,
Equipe Agenda
`;

    const html = `
<div style="font-family: Arial, sans-serif; line-height: 1.6">
  <h2>Consulta cancelada ❌</h2>

  <p>Olá, <strong>${name}</strong>!</p>

  <p>Sua consulta foi cancelada.</p>

  <ul>
    <li><strong>📅 Data:</strong> ${date}</li>
    <li><strong>⏰ Horário:</strong> ${startTime} às ${endTime}</li>
  </ul>

  <p>Você pode reagendar uma nova consulta pela plataforma.</p>

  <p style="margin-top: 24px">
    Atenciosamente,<br />
    <strong>Equipe Agenda</strong>
  </p>
</div>
`;

    await this.sendMail(to, subject, text, html);
  }

  async sendNutritionistAppointmentScheduled(params: {
    to: string;
    clientName: string;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    const { to, clientName, date, startTime, endTime } = params;

    const subject = 'Nova consulta agendada';

    const text = `
      Olá!

      Uma nova consulta foi agendada.

      Cliente: ${clientName}
      📅 Data: ${date}
      ⏰ Horário: ${startTime} às ${endTime}

      Atenciosamente,
      Equipe Agenda
        `;

    const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6">
    <h2>Nova consulta agendada 📅</h2>

    <p>Uma nova consulta foi agendada.</p>

    <ul>
      <li><strong>Cliente:</strong> ${clientName}</li>
      <li><strong>📅 Data:</strong> ${date}</li>
      <li><strong>⏰ Horário:</strong> ${startTime} às ${endTime}</li>
    </ul>

    <p style="margin-top: 24px">
      Atenciosamente,<br />
      <strong>Equipe Agenda</strong>
    </p>
  </div>
  `;

    await this.sendMail(to, subject, text, html);
  }

  async sendNutritionistAppointmentCanceled(params: {
    to: string;
    clientName: string;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    const { to, clientName, date, startTime, endTime } = params;

    const subject = 'Consulta cancelada';

    const text = `
Olá!

A seguinte consulta foi cancelada:

Cliente: ${clientName}
📅 Data: ${date}
⏰ Horário: ${startTime} às ${endTime}

Atenciosamente,
Equipe Agenda
  `;

    const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6">
    <h2>Consulta cancelada ❌</h2>

    <ul>
      <li><strong>Cliente:</strong> ${clientName}</li>
      <li><strong>📅 Data:</strong> ${date}</li>
      <li><strong>⏰ Horário:</strong> ${startTime} às ${endTime}</li>
    </ul>

    <p style="margin-top: 24px">
      Atenciosamente,<br />
      <strong>Equipe Agenda</strong>
    </p>
  </div>
  `;

    await this.sendMail(to, subject, text, html);
  }
}
