using GobernanzaIA.Dominio.Entidades;
using GobernanzaIA.Dominio.Interfaces;
using GobernanzaIA.Infraestructura.Datos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GobernanzaIA.Infraestructura.Repositorios
{
    public class RepositorioUsuario : IRepositorioUsuario
    {
        private readonly ApplicationDbContext _context;

        public RepositorioUsuario(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Usuario?> ObtenerPorEmailAsync(string email)
        {
            return await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<Usuario?> ObtenerPorIdAsync(Guid id)
        {
            return await _context.Usuarios.FindAsync(id);
        }

        public async Task AgregarAsync(Usuario usuario)
        {
            await _context.Usuarios.AddAsync(usuario);
            await _context.SaveChangesAsync();
        }

        public async Task ActualizarAsync(Usuario usuario)
        {
            _context.Usuarios.Update(usuario);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> EmailExisteAsync(string email)
        {
            return await _context.Usuarios.AnyAsync(u => u.Email == email);
        }
    }
}
