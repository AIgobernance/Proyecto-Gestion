using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class _003 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Farm",
                table: "Milks");

            migrationBuilder.AddColumn<Guid>(
                name: "FarmId",
                table: "Cows",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Farms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Farms", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cows_FarmId",
                table: "Cows",
                column: "FarmId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cows_Farms_FarmId",
                table: "Cows",
                column: "FarmId",
                principalTable: "Farms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cows_Farms_FarmId",
                table: "Cows");

            migrationBuilder.DropTable(
                name: "Farms");

            migrationBuilder.DropIndex(
                name: "IX_Cows_FarmId",
                table: "Cows");

            migrationBuilder.DropColumn(
                name: "FarmId",
                table: "Cows");

            migrationBuilder.AddColumn<string>(
                name: "Farm",
                table: "Milks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
