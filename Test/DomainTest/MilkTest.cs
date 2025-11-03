using Domain;

namespace DomainTest
{
    public class MilkTests
    {
      private Milk milk { get; set; }

        [SetUp]
        public void Setup()
        {

            milk = new Milk();
            milk.Id = Guid.NewGuid();
            milk.Litters = 10;
            milk.ProductionDate = DateTime.Now; 
            milk.ExpirationDate = DateTime.Now.AddDays(7);  
            milk.CowId = Guid.Empty;

        }

        [Test]
        public void Milk_Exist()
        {
            Assert.That(milk, Is.Not.Null);
            Assert.That(milk.Id, Is.Not.EqualTo(Guid.Empty));
            Assert.That(milk.Litters, Is.EqualTo(10));
            Assert.That(milk.ProductionDate, Is.LessThan(milk.ExpirationDate));
        }

        [Test]
        public void Milk_SetLitrers_Works()
        {
            //Arrange
            int additionalLitters = 5000; // 5 liters
            //Act
            milk.SetLitrers(additionalLitters);
            //Assert
            Assert.That(milk.Litters, Is.EqualTo(15)); // 10 + 5 = 15 liters
        }
        [Test]
        public void Milk_SetProductionDate_Works()
        {
            //Arrange
            DateTime newProductionDate = new DateTime(2024, 1, 1);
            //Act
            milk.SetProductionDate(newProductionDate);
            //Assert
            Assert.That(milk.ProductionDate, Is.EqualTo(newProductionDate));
            Assert.That(milk.ExpirationDate, Is.EqualTo(newProductionDate.AddDays(7)));
        }
    }
}
