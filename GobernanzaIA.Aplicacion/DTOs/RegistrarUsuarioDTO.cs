using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GobernanzaIA.Aplicacion.DTOs
{
    public class RegistrarUsuarioDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmarPassword { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string NombreEmpresa { get; set; } = string.Empty;
        public string Sector { get; set; } = string.Empty;
        public int NumeroEmpleados { get; set; }
    }

}
