const sequelize = require('../config/db');
const User = require('./User');
const Role = require('./Role');
const Ticket = require('./Ticket');
const Inventory = require('./Inventory');
const Document = require('./Document');
const Credential = require('./Credential');
const Comment = require('./Comment');
const Message = require('./Message');
const History = require('./History');
const TicketAttachment = require('./TicketAttachment');
const UserSetting = require('./UserSetting');

// Define associations
User.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(User, { foreignKey: 'roleId' });

Ticket.belongsTo(User, { foreignKey: 'userId', as: 'creator' });
Ticket.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
User.hasMany(Ticket, { foreignKey: 'userId' });
User.hasMany(Ticket, { foreignKey: 'assignedTo' });

Comment.belongsTo(Ticket, { foreignKey: 'ticketId' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Ticket.hasMany(Comment, { foreignKey: 'ticketId' });
User.hasMany(Comment, { foreignKey: 'userId' });

Message.belongsTo(Ticket, { foreignKey: 'ticketId' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'sender' });
Ticket.hasMany(Message, { foreignKey: 'ticketId' });
User.hasMany(Message, { foreignKey: 'userId' });

TicketAttachment.belongsTo(Ticket, { foreignKey: 'ticketId' });
TicketAttachment.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
Ticket.hasMany(TicketAttachment, { foreignKey: 'ticketId' });
User.hasMany(TicketAttachment, { foreignKey: 'uploadedBy' });

Inventory.belongsTo(User, { foreignKey: 'assignedTo' });
User.hasMany(Inventory, { foreignKey: 'assignedTo' });

Document.belongsTo(User, { foreignKey: 'createdBy' });
User.hasMany(Document, { foreignKey: 'createdBy' });

Credential.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Credential.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });
User.hasMany(Credential, { foreignKey: 'createdBy' });
User.hasMany(Credential, { foreignKey: 'updatedBy' });

History.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(History, { foreignKey: 'userId' });

UserSetting.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(UserSetting, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Role,
  Ticket,
  Inventory,
  Document,
  Credential,
  Comment,
  Message,
  History,
  TicketAttachment,
  UserSetting,
};