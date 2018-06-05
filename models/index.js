import Sequelize from 'sequelize';

const sequelize = new Sequelize("mysql://root:root@localhost:3306/lintrim");

const models = {
    User: sequelize.import('./user'),
};


Object.keys(models).forEach(modelName => {
    if ('associate' in models[modelName]) {
        models[modelName].associate(models);
    }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;