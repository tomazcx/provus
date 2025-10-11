import mjml2html = require('mjml');
import { Injectable } from '@nestjs/common';
import { recoverPasswordTemplate } from 'src/shared/email-templates/recover-password.template';
import { confirmEmailTemplate } from 'src/shared/email-templates/confirm-email.template';
import { submissaoCriadaTemplate } from 'src/shared/email-templates/submissao-criada';

@Injectable()
export class EmailTemplatesProvider {
  recoverPassword(hash: string): string {
    const { html } = mjml2html(recoverPasswordTemplate(hash));

    return html;
  }

  confirmEmail(hash: string): string {
    const { html } = mjml2html(confirmEmailTemplate(hash));

    return html;
  }

  submissaoCriada(url: string, nomeProva?: string): string {
    const { html } = mjml2html(submissaoCriadaTemplate(url, nomeProva));

    return html;
  }
}
