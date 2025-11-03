using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class milkAditionList : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cows_Milks_MilkId",
                table: "Cows");

            migrationBuilder.DropIndex(
                name: "IX_Cows_MilkId",
                table: "Cows");

            migrationBuilder.DropColumn(
                name: "MilkId",
                table: "Cows");

            migrationBuilder.AddColumn<Guid>(
                name: "CowId",
                table: "Milks",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "ProductionDate",
                table: "Milks",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Milks_CowId",
                table: "Milks",
                column: "CowId");

            migrationBuilder.AddForeignKey(
                name: "FK_Milks_Cows_CowId",
                table: "Milks",
                column: "CowId",
                principalTable: "Cows",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Milks_Cows_CowId",
                table: "Milks");

            migrationBuilder.DropIndex(
                name: "IX_Milks_CowId",
                table: "Milks");

            migrationBuilder.DropColumn(
                name: "CowId",
                table: "Milks");

            migrationBuilder.DropColumn(
                name: "ProductionDate",
                table: "Milks");

            migrationBuilder.AddColumn<Guid>(
                name: "MilkId",
                table: "Cows",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Cows_MilkId",
                table: "Cows",
                column: "MilkId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cows_Milks_MilkId",
                table: "Cows",
                column: "MilkId",
                principalTable: "Milks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
