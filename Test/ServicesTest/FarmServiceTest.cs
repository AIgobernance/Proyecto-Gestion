using AutoMapper;
using Domain;
using Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Protocols;
using Moq;
using Services;
using Services.Automapper;
using System.Collections.Generic;
using System.Linq;

namespace ServicesTest
{
    public class FarmServiceTest
    {
        private IFarmService farmService {  get; set; }
        //se hace mock de las clases de dependencia
        Mock<IFarmRepository> milkRepositoryMock { get; set; }
        Farm farm { get; set; }
        IMapper mapper { get; set; }

        [SetUp]
        public void Setup()
        {
            farm = new Farm();
            farm.Id = Guid.NewGuid();
            //se implementa el mock y se hace setup  de los metodos requeridos para la prueba
            milkRepositoryMock = new Mock<IFarmRepository>();
            milkRepositoryMock.Setup(x => x.GetFarm(It.IsAny<Guid>())).ReturnsAsync(farm);
            mapper = new MapperConfiguration(cfg => new MappingProfile() ).CreateMapper();
            //no s epuede hacer mock de esta clase se instanci con los parametros requeridos
            Dictionary<string, string> inMemorySettings = new Dictionary<string, string> 
            {
              {"AllowedHosts", "*"},
              {"ConnectionStrings:Defaultconnection", "Server=localhost,1433;Database=ApiTestDb;user id=SA;password=Passw0rd1ns3c;TrustServerCertificate=True"},
                //...populate as needed for the test
            };
            
            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            farmService = new FarmService(mapper, configuration, milkRepositoryMock.Object);
        }

        [Test]
        public void MilkService_Exist()
        {
            Assert.NotNull(farmService);
            var result = farmService.GetFarm(farm.Id);
            Assert.That(result.Result.Id, Is.EqualTo(farm.Id));
        }
    }
}