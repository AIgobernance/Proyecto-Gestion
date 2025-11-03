using GobernanzaIA.Dominio.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GobernanzaIA.Infraestructura.Servicios
{
    public class ServicioEmail : IServicioEmail
    {
        private readonly ConfiguracionEmail _configuracion;

        public ServicioEmail(ConfiguracionEmail configuracion)
        {
            _configuracion = configuracion;
        }

        public async Task EnviarEmailAsync(string destinatario, string asunto, string cuerpo)
        {
            var mensaje = new MimeMessage();
            mensaje.From.Add(new MailboxAddress("Sistema Gobernanza IA", _configuracion.From));
            mensaje.To.Add(new MailboxAddress("", destinatario));
            mensaje.Subject = asunto;

            mensaje.Body = new TextPart("html") { Text = cuerpo };

            using var cliente = new SmtpClient();
            await cliente.ConnectAsync(_configuracion.SmtpServer, _configuracion.Port, true);
            await cliente.AuthenticateAsync(_configuracion.Username, _configuracion.Password);
            await cliente.SendAsync(mensaje);
            await cliente.DisconnectAsync(true);
        }
    }

    public class ConfiguracionEmail
    {
        public string SmtpServer { get; set; } = "smtp.gmail.com";
        public int Port { get; set; } = 587;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string From { get; set; } = string.Empty;
    }
}
