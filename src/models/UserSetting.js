const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserSetting = sequelize.define('UserSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  emailAlerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  darkMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'es'
  }
}, {
  tableName: 'UserSettings',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = UserSetting;