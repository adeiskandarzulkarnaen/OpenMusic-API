const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }
  
  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);
    
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };
    
    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) throw new InvariantError('User gagal ditambahkan');
    
    return rows[0].id;
  }
  
  async findUserByid(userId) {
    const query = {
      text: 'SELECT username FROM users WHERE id = $1',
      values: [userId],
    };
    
    const { rows, rowCount } = await this._pool.query(query);
    
    if (!rowCount) throw new NotFoundError('User tidak ditemukan');
    
    return rows[0].username;
  }
  
  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };
    
    const { rowCount } = await this._pool.query(query);
    
    if (rowCount) throw new InvariantError('username sudah digunakan.');
  }
  
  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };
    
    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) throw new AuthenticationError('username yang anda masukan salah');
    
    const { id, password: hashedPassword } = rows[0];
    
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) throw new AuthenticationError('password yang anda masukan salah');
    
    return id;
  }
};

module.exports = UsersService;
