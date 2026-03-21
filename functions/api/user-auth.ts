import { getCollection, putCollection, json, requireUser, sanitizeUser, authenticateAdmin } from './_middleware'
import type { UserRecord } from './_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// POST: register / login (no auth required)
// GET: get current user (requires X-User-Token) OR admin list all users (requires X-Admin-Token + ?admin=1)
// PUT: update profile / change password / add points / use points (requires X-User-Token)

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json() as Record<string, any>
  const { action } = body
  const kv = context.env.ZOLTMOUNT_KV

  if (action === 'register') {
    const { email, password, firstName, lastName } = body
    if (!email || !password || !firstName || !lastName) {
      return json({ error: 'Missing required fields' }, 400)
    }

    const users = await getCollection<UserRecord>(kv, 'users')
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return json({ error: 'emailExists' }, 409)
    }

    const token = crypto.randomUUID()
    const newUser: UserRecord = {
      id: `user-${Date.now()}`,
      email,
      password,
      firstName,
      lastName,
      phone: '',
      addresses: [],
      points: 0,
      totalSpent: 0,
      memberSince: new Date().toISOString(),
      token,
    }

    users.push(newUser)
    await putCollection(kv, 'users', users)

    return json({ token, user: sanitizeUser(newUser) })
  }

  if (action === 'login') {
    const { email, password } = body
    if (!email || !password) {
      return json({ error: 'Missing required fields' }, 400)
    }

    const users = await getCollection<UserRecord>(kv, 'users')
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!user) {
      return json({ error: 'invalidCredentials' }, 401)
    }

    // Generate new token on each login
    user.token = crypto.randomUUID()
    await putCollection(kv, 'users', users)

    return json({ token: user.token, user: sanitizeUser(user) })
  }

  return json({ error: 'Invalid action' }, 400)
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)

  // Admin listing all users: GET /api/user-auth?admin=1
  if (url.searchParams.get('admin') === '1') {
    const adminAuth = await authenticateAdmin(context.request, context.env)
    if (!adminAuth) {
      return json({ error: 'Unauthorized' }, 401)
    }
    const users = await getCollection<UserRecord>(context.env.ZOLTMOUNT_KV, 'users')
    const safeUsers = users.map((u) => sanitizeUser(u))
    return json(safeUsers)
  }

  // Normal user: get own profile
  const result = await requireUser(context.request, context.env.ZOLTMOUNT_KV)
  if ('denied' in result) return result.denied

  return json({ user: sanitizeUser(result.user) })
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const kv = context.env.ZOLTMOUNT_KV
  const result = await requireUser(context.request, kv)
  if ('denied' in result) return result.denied

  const { user, users } = result
  const body = await context.request.json() as Record<string, any>
  const { action } = body

  if (action === 'updateProfile') {
    const { firstName, lastName, phone } = body
    if (firstName !== undefined) user.firstName = firstName
    if (lastName !== undefined) user.lastName = lastName
    if (phone !== undefined) user.phone = phone
    await putCollection(kv, 'users', users)
    return json({ user: sanitizeUser(user) })
  }

  if (action === 'changePassword') {
    const { oldPassword, newPassword } = body
    if (user.password !== oldPassword) {
      return json({ error: 'wrongPassword' }, 400)
    }
    user.password = newPassword
    await putCollection(kv, 'users', users)
    return json({ success: true })
  }

  if (action === 'addPoints') {
    const { points, spent } = body
    if (typeof points !== 'number' || points < 0) {
      return json({ error: 'Invalid points' }, 400)
    }
    user.points += points
    if (typeof spent === 'number' && spent > 0) {
      user.totalSpent += spent
    }
    await putCollection(kv, 'users', users)
    return json({ user: sanitizeUser(user) })
  }

  if (action === 'usePoints') {
    const { points } = body
    if (typeof points !== 'number' || points < 0) {
      return json({ error: 'Invalid points' }, 400)
    }
    if (user.points < points) {
      return json({ error: 'Insufficient points' }, 400)
    }
    user.points -= points
    await putCollection(kv, 'users', users)
    return json({ user: sanitizeUser(user) })
  }

  return json({ error: 'Invalid action' }, 400)
}
