using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GobernanzaIA.Dominio.Interfaces
{
    public interface IServicioSMS
    {
        Task EnviarSMSAsync(string telefono, string mensaje);
    }
}
