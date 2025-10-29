const { Inventory, User, History } = require('../models');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({ include: User });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInventoryByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const inventory = await Inventory.findAll({
      where: { assignedTo: userId },
      include: User
    });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id, { include: User });
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createInventory = async (req, res) => {
  try {
    const { propiedad, it, area, responsable, serial, capacidad, ram, marca, status, location, warrantyExpiry } = req.body;
    const item = await Inventory.create({
      propiedad,
      it,
      area,
      responsable,
      serial,
      capacidad,
      ram,
      marca,
      status,
      location,
      warrantyExpiry,
      assignedTo: req.user.id
    });
    await History.create({ action: 'CREATE', tableName: 'Inventories', recordId: item.id, newValues: item.toJSON(), userId: req.user.id });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateInventory = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    const oldValues = item.toJSON();
    const { propiedad, it, area, responsable, serial, capacidad, ram, marca, status, location, warrantyExpiry } = req.body;
    await item.update({
      propiedad,
      it,
      area,
      responsable,
      serial,
      capacidad,
      ram,
      marca,
      status,
      location,
      warrantyExpiry
    });
    await History.create({ action: 'UPDATE', tableName: 'Inventories', recordId: item.id, oldValues, newValues: item.toJSON(), userId: req.user.id });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    await History.create({ action: 'DELETE', tableName: 'Inventories', recordId: item.id, oldValues: item.toJSON(), userId: req.user.id });
    await item.destroy();
    res.json({ message: 'Inventory item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const detectHardware = async (req, res) => {
  try {
    let serial = '';
    let capacidad = '';
    let ram = '';
    let marca = '';

    // Detect OS and use appropriate commands
    const { stdout: osInfo } = await execAsync('wmic os get Caption /value');
    const isWindows = osInfo.includes('Windows');

    if (isWindows) {
      // Get Serial Number
      try {
        const { stdout: serialOutput } = await execAsync('wmic bios get serialnumber /value');
        const serialMatch = serialOutput.match(/SerialNumber=(\S+)/);
        serial = serialMatch ? serialMatch[1] : '';
      } catch (err) {
        console.log('Could not get serial number:', err.message);
      }

      // Get Storage Capacity
      try {
        const { stdout: diskOutput } = await execAsync('wmic diskdrive get size /value');
        const sizeMatch = diskOutput.match(/Size=(\d+)/);
        if (sizeMatch) {
          const sizeGB = Math.round(parseInt(sizeMatch[1]) / (1024 * 1024 * 1024));
          capacidad = `${sizeGB}GB`;
        }
      } catch (err) {
        console.log('Could not get storage capacity:', err.message);
      }

      // Get RAM
      try {
        const { stdout: ramOutput } = await execAsync('wmic memorychip get capacity /value');
        const ramMatches = ramOutput.match(/Capacity=(\d+)/g);
        if (ramMatches) {
          const totalRam = ramMatches.reduce((total, match) => {
            const capacity = parseInt(match.replace('Capacity=', ''));
            return total + capacity;
          }, 0);
          const ramGB = Math.round(totalRam / (1024 * 1024 * 1024));
          ram = `${ramGB}GB`;
        }
      } catch (err) {
        console.log('Could not get RAM:', err.message);
      }

      // Get Brand/Model
      try {
        const { stdout: brandOutput } = await execAsync('wmic computersystem get manufacturer /value');
        const brandMatch = brandOutput.match(/Manufacturer=(\S+)/);
        marca = brandMatch ? brandMatch[1] : '';
      } catch (err) {
        console.log('Could not get brand:', err.message);
      }
    } else {
      // For Linux/Mac, you might need different commands
      // This is a basic implementation - could be expanded
      res.status(501).json({ error: 'Hardware detection not implemented for this OS' });
      return;
    }

    res.json({
      serial: serial || 'No detectado',
      capacidad: capacidad || 'No detectado',
      ram: ram || 'No detectado',
      marca: marca || 'No detectado'
    });
  } catch (err) {
    console.error('Error detecting hardware:', err);
    res.status(500).json({ error: 'Error detecting hardware components' });
  }
};

module.exports = { getAllInventory, getInventoryById, getInventoryByUser, createInventory, updateInventory, deleteInventory, detectHardware };