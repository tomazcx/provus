import { EmailTemplatesProvider } from 'src/data/protocols/email-templates';
import mjml2html = require('mjml');
import { confirmEmailTemplate, recoverPasswordTemplate } from './templates';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailTemplatesImpl implements EmailTemplatesProvider {
  recoverPassword(hash: string): string {
    const { html } = mjml2html(recoverPasswordTemplate(hash));

    return html;
  }

  confirmEmail(hash: string): string {
    const { html } = mjml2html(confirmEmailTemplate(hash));

    return html;
  }
}
