using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Query.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
    public class BaseRepository
    {
        public readonly AppDbContext context;
        public BaseRepository(AppDbContext context)
        {
            this.context = context;
        }

        public async Task Save()
        {
            await context.SaveChangesAsync();
        }

        public async Task Beguin()
        {
            await context.Database.BeginTransactionAsync();
        }
        public async Task Comit()
        {
            await context.Database.CommitTransactionAsync();
        }

        public async Task RollBack()
        {
            await context.Database.RollbackTransactionAsync();
        }
    }
}
