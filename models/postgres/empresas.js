module.exports = (sequelize, type) => {
  empresas = sequelize.define(
    "empresas",
    {
      cnpj: {
        type: type.STRING,
        primaryKey: true
      },
      razao_social: type.STRING,
    },
    {
      timestamps: false,
      freezeTableName: true
    }
  );

  empresas.associate = function (models) {
    empresas.hasMany(models.empresasParlamentares, {
      foreignKey: "cnpj",
      targetKey: "cnpj",      
      as: "empresaParlamentar"
    }),
    empresas.hasMany(models.atividadesEconomicasEmpresas, {
      foreignKey: "cnpj",
      targetKey: "cnpj",      
      as: "empresaAtividadeEconomica"
    })
  };
  return empresas;
};
