namespace Services.Models.MilkModels
{
    public class MilkModel
    {
        public Guid Id { get; set; }
        public int Litters {  get; set; }
        public String Farm {  get; set; }
        public DateTime ExpirationDate { get; set; }
    }
}
