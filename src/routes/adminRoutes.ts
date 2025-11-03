import { Router } from 'express'
import { AdminController } from '../controllers/adminController'
import { Pool } from 'pg'

export function createAdminRouter(dbService: Pool): Router {
    const controller = new AdminController(dbService)
    const router = Router()
    router.get("/users", controller.getUsers)
    router.get("/users/:email", controller.getUserByEmail)
    router.get("/users/:api_key", controller.getUserByKey)
    return router
}