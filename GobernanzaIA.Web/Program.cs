using GobernanzaIA.Infraestructura.Datos;
using GobernanzaIA.Infraestructura.Repositorios;
using GobernanzaIA.Dominio.Interfaces;
using GobernanzaIA.Aplicacion.Servicios;
using GobernanzaIA.Infraestructura.Servicios;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

// MVC / Razor Pages
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

// Connection string desde appsettings
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' no encontrada en appsettings.json");
}

// DbContext con SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Registrar repositorios y servicios
builder.Services.AddScoped<IRepositorioUsuario, RepositorioUsuario>();
builder.Services.AddScoped<ServicioAutenticacion>();

// Configuración e implementación del email
var emailConfig = builder.Configuration.GetSection("Email").Get<ConfiguracionEmail>() ?? new ConfiguracionEmail { From = "no-reply@local", SmtpServer = "localhost", Port = 25 };
builder.Services.AddSingleton(emailConfig);
builder.Services.AddScoped<IServicioEmail, ServicioEmail>();

// Servicio SMS no-op para evitar errores de DI si no tienes implementación
builder.Services.AddScoped<IServicioSMS, ServicioSMSNull>();

// Autenticación por cookies
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Cuenta/Login";
        options.ExpireTimeSpan = TimeSpan.FromHours(1);
    });

var app = builder.Build();

// Pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapRazorPages();

app.Run();

// Implementación local simple de IServicioSMS para evitar fallos de DI en desarrollo.
public class ServicioSMSNull : IServicioSMS
{
    public Task EnviarSMSAsync(string telefono, string mensaje)
    {
        Console.WriteLine($"[SMS-NULL] To: {telefono}, Msg: {mensaje}");
        return Task.CompletedTask;
    }
}
