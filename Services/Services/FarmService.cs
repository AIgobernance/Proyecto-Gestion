using AutoMapper;
using Domain;
using Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Services.Models.CowModels;
using Services.Models.FarmModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class FarmService : IFarmService
    {

        private IFarmRepository FarmRepository{ get; set; }
        private IMapper Mapper { get; set; }
        private IConfiguration Configuration { get; set; }
        public FarmService(IMapper mapper,IConfiguration configuration, IFarmRepository farmRepository)
        {
            Mapper = mapper;
            FarmRepository = farmRepository;
            Configuration = configuration;
        }
        public async Task <IList<FarmModel>> GetFarms()
        {
            
            return Mapper.Map<IList<FarmModel>>(await FarmRepository.GetFarms());

        }

        public async Task AddFarm(AddFarmModel model)
        {
            await FarmRepository.Save(Mapper.Map<Farm>(model));
        }

        public async Task<FarmModel> GetFarm(Guid id)
        {
           return Mapper.Map<FarmModel> (await FarmRepository.GetFarm(id));
        }

        public async Task AddCow(AddCowModel model)
        {
            var farm = await FarmRepository.GetFarm(model.FarmId);
            farm.Cows.Add(Mapper.Map<Cow>(model));
            await FarmRepository.UpDate(farm);
        }
    }
}
