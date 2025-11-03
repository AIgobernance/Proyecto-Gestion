using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GobernanzaIA.Aplicacion.Servicios
{
    public class ServicioAutenticacion
{
    private readonly IRepositorioUsuario _repositorioUsuario;
    private readonly IServicioEmail _servicioEmail;
    private readonly IServicioSMS _servicioSMS;
    
    public ServicioAutenticacion(
        IRepositorioUsuario repositorioUsuario,
        IServicioEmail servicioEmail,
        IServicioSMS servicioSMS)
    {
        _repositorioUsuario = repositorioUsuario;
        _servicioEmail = servicioEmail;
        _servicioSMS = servicioSMS;
    }
    
    public async Task<ResultadoRegistro> RegistrarUsuarioAsync(RegistrarUsuarioDto registroDto)
    {
        // Validaciones básicas
        if (await _repositorioUsuario.EmailExisteAsync(registroDto.Email))
            return ResultadoRegistro.Error("El email ya está registrado");
            
        if (registroDto.Password != registroDto.ConfirmarPassword)
            return ResultadoRegistro.Error("Las contraseñas no coinciden");
        
        // Crear usuario
        var usuario = new Usuario
        {
            Email = registroDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registroDto.Password), // Hashear password
            Nombre = registroDto.Nombre,
            Apellido = registroDto.Apellido,
            NombreEmpresa = registroDto.NombreEmpresa,
            Sector = registroDto.Sector,
            NumeroEmpleados = registroDto.NumeroEmpleados,
            DosFactoresHabilitado = true // Por defecto habilitado
        };
        
        await _repositorioUsuario.AgregarAsync(usuario);
        return ResultadoRegistro.Exitoso();
    }
    
    public async Task<ResultadoLogin> LoginAsync(LoginDto loginDto)
    {
        var usuario = await _repositorioUsuario.ObtenerPorEmailAsync(loginDto.Email);
        if (usuario == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, usuario.PasswordHash))
            return ResultadoLogin.Error("Credenciales inválidas");
            
        // Lógica de 2 factores aquí...
        return ResultadoLogin.Exitoso(usuario);
    }
}

public class ResultadoRegistro
{
    public bool Exitoso { get; set; }
    public string Error { get; set; } = string.Empty;
    
    public static ResultadoRegistro Exitoso() => new() { Exitoso = true };
    public static ResultadoRegistro Error(string error) => new() { Exitoso = false, Error = error };
}

public class ResultadoLogin
{
    public bool Exitoso { get; set; }
    public Usuario? Usuario { get; set; }
    public string Error { get; set; } = string.Empty;
    public bool RequiereDosFactores { get; set; }
    
    public static ResultadoLogin Exitoso(Usuario usuario) => new() { Exitoso = true, Usuario = usuario };
    public static ResultadoLogin Error(string error) => new() { Exitoso = false, Error = error };
}
}
