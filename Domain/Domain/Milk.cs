using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Milk
    {
        //indicamos que id es la llave primaria
        [Key]
        public Guid Id { get; set; }
        public int Litters { get; set; }
  
        public DateTime ProductionDate { get; set; }
        public DateTime ExpirationDate { get; set; }
        public Guid CowId { get; set; }
        public Cow Cow { get; set; }
        public Milk() 
        {
         
        }

       public void SetLitrers(int m3)
        {
            Litters = Litters + m3/1000;
        }

        public void SetProductionDate(DateTime date)
        {
            ProductionDate = date;
            ExpirationDate = date.AddDays(7);
        }

    }
}
