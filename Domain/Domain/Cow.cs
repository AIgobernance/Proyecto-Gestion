using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Cow
    {
        [Key]
        public Guid Id { get; set; }
        public string Race {  get; set; }
        public List<Milk> Milks { get; set; }
        public Guid FarmId { get; set; }
        public Farm Farm { get; set; }
        public Cow()
        {
            Milks = new List<Milk>();
        }

        public int getTotalLiters()
        {
            int liters = 0;
            foreach(var milk in Milks)
            {
                liters = milk.Litters + liters;
            }
            return liters;
        }
    }
}
