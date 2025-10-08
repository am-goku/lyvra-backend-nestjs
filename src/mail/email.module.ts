import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      },
      defaults: {
        from: `"Lyvra" <${process.env.SMTP_FROM}>`,
      },
      template: {
        dir: join(process.cwd(), 'src/mail/templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true }
      }
    }),
  ],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule { }
