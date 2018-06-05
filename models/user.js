export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email: DataTypes.STRING,
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        phone: DataTypes.STRING,
        password: DataTypes.STRING,
        uniqueString: DataTypes.STRING //для подверждения email и сброса пароля
    });

    User.associate = (models) => {};

    return User;
};