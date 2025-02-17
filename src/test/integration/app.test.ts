import request from 'supertest'
import server from '../../server'
import connectDB, { db } from '../../config/db'

describe('Authentication - Create account', () => {

    beforeAll( async () => {
        await connectDB()
    })

    afterAll(async () => {
        // Cierra la conexión de Sequelize
        await db.close();
      });

    it('should display validation errors when form is mepty', async () => {
        const response = await request(server)
                                .post('/api/auth/create-account')
                                .send({})

        expect(response.statusCode).toBe(400)                              
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(3)
        
        expect(response.statusCode).not.toBe(200)
        expect(response.body.errors).not.toHaveLength(2)

    })
})