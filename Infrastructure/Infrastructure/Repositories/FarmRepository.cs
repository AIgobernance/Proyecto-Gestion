using Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class FarmRepository : BaseRepository, IFarmRepository
    {
        public FarmRepository(AppDbContext context) : base(context)
        {
        }

       
        public async Task<Farm> GetFarm(Guid id)
        {
            return await context.Farms.FirstAsync(x=>x.Id.Equals(id));
        }

        public async  Task<IList<Farm>> GetFarms()
        {
            return await context.Farms
                .Include(x=>x.Cows)
                .ThenInclude(x=>x.Milks)
                
                .ToListAsync();
        }

       

        public async Task Save(Farm farm)
        {
            try
            {
                await Beguin();
                await context.Farms.AddAsync(farm);
                await Comit();
                await Save();
            }
            catch (Exception ex) 
            {
                await RollBack();
                throw ex;
            }
        }

        public async Task UpDate(Farm famr)
        {
            try
            {
                await Beguin();
                await context.SaveChangesAsync();
                await Comit();
                await Save();
            }
            catch (Exception ex)
            {
                await RollBack();
                throw ex;
            }
        }
    }
}
