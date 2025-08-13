# Prisma

Mongkhon Wichaiphap

## Running
### Database
```
docker compose up -d 
```
### Schema
```
npx prisma init --datasource-provider postgresql
npx prisma generate
npx prisma db push
npx prisma studio
```

## Develop
```bash
npx prisma generate
```
