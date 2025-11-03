using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GobernanzaIA.Aplicacion.DTOs
{
    public class Verificar2FADto
    {
        public string UsuarioId { get; set; } = string.Empty;
        public string Codigo { get; set; } = string.Empty;
    }
}
