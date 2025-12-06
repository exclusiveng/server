# Subscribers Directory

This directory contains TypeORM entity subscribers for listening to entity events.

## Example Subscriber

```typescript
import { EventSubscriber, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { User } from '../entities/User';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  beforeInsert(event: InsertEvent<User>) {
    console.log('Before user inserted:', event.entity);
  }
}
```
