using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GobernanzaIA.Dominio.Entidades
{
    public class Usuario
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string NombreEmpresa { get; set; } = string.Empty;
        public string Sector { get; set; } = string.Empty;
        public int NumeroEmpleados { get; set; }
        public bool DosFactoresHabilitado { get; set; }
        public string? CodigoDosFactores { get; set; }
        // Nuevo: expiración del código 2FA
        public DateTime? CodigoDosFactoresExpiracion { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public bool Activo { get; set; } = true;
    }
}
