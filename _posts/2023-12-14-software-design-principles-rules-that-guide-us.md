---
title: "Software Design Principles: Rules that guide us"
date: 2023-12-14 03:37:00 +0000
image: "/assets/images/posts/software-design-principles-rules-that-guide-us.jpg"
tags:
  - Software Design
  - Software Development
  - Software Engineering
external_url: "https://medium.com/@bitaron90/software-design-principles-rules-that-guide-us-270fb551e852"
excerpt: >-
  Use a simple lock-module example to see how encapsulation, DRY, single
  responsibility, separation of concerns, and open-closed design guide practical
  software decisions.
---

> Originally published on [Medium](https://medium.com/@bitaron90/software-design-principles-rules-that-guide-us-270fb551e852).


**Abraham Lincoln once said: If I had eight hours to chop down a tree, I would spend six sharpening my axe.** This profound wisdom applies to all kinds of tasks. In software engineering, this is a fundamental rule. While developing software, we should spend a good portion of time on the design process. There are some numbers based on statistics in the book Code Complete. I highly recommend all to read this book.

However, the design process is the most overlooked part of software development. In this article, I am documenting my thought process of designing. It is more of a historical record of my capabilities. And if it helps and creates awareness, then that is a plus. I have chosen a simple lock module as an example.

Suppose I am building exam management software with three modules:

1. Seat plan
2. Mark entry
3. Result calculation

And some use cases among many:

1. Users can generate seat plan
2. Users can lock/ unlock seat plan generation action
3. Users can input mark
4. Users can lock/ unlock mark entry
5. Users can calculate results
6. Users can lock/ unlock result calculation
7. Users can make request(for lock/unlock) and accept/reject for the above features

I want to design the lock/unlock part of the system. **I can think of three ways to do it. I will list them below from worst to best.**

1. I can create a lock class for each type of action. A class for locking seat plan generation. Another class for locking mark entry and so on. It violates most of the principles, especially the DRY(Do not repeat yourself) principle. Every change needs to be propagated to multiple places. Not maintainable, reusable, and scalable. In short, it is not an enterprise-level solution.
2. We can create a single class with an identifier for each type of action and another for a specific action. E.g.: A lock for MARK\_ENTYR type action with mark entry id of a specific subject. It is better. It doesn’t violate the DRY principle. But it is tightly coupled. It knows all the modules it works with. Changes in the client might force it to change. Those changes might break the OCP(Open-close principle). Separation of concerns is not maintained. The lock module might need to facilitate various clients’ requirements. It can also break the SRP(Single responsibility) principle. As it knows about the client, it might be tempted to do some work for the client. Also, there could be some scalability issues. With a strict development process, I can solve these issues. It might be possible for initial developers but not feasible for others to follow. So I would not recommend this as an enterprise-level solution.

Before the third and my preferred design, I want to list some of the criteria to follow. **Design should be :**

1. Loosely coupled
2. Does not violate DRY
3. Adhere to SRP
4. Has separation of concern
5. Maintain OCP
6. Properly encapsulated
7. Modular and portable

Let us digress. We are building a house. There are three rooms. We need a way to secure them when we go out. So what do we do? Of course, we buy locks from the stores. There are different kinds of locks based on size, shape, mechanism, etc. Assume there is only one store and it sells only one type of lock. We go to the store, buy locks, and use them. As simple as that. We do not need to tell the store anything about our room(even in the real world we at most need to divulge to the store what kind of lock applies to the room but do not need to specify the room location, size, or anything that can identify the room).

**If I take that analogy and apply it to this problem, what it would look like:**

1. We will have a Lock store, in this case, a Lock class.
2. The client will create a lock object and use it as it wishes.
3. The lock class will not know anything about the client.

Looks simple. It makes me wonder if this can fulfill all the requirements that might arise in the future. So I will list some requirements:

1. Can lock and unlock
2. Can execute functions based on lock/unlock action
3. Can get lock history
4. Can request lock/unlock and accept or reject them
5. Can perform additional actions based on core actions.

All these seem doable. As for the additional actions I can use Java Generic or my favorite event-driven messaging architecture. I have added the implementation using Java Generic at the end of the post.

**So what benefit did I get?** For one thing, if in the future I am building simulation software for the house and room mentioned, I can just pick up the lock module and put it in the new project without any changes. Portable.

- The module is loosely coupled with the client.
- Doesn’t violate the DRY.
- The lock module can provide a tagging system for the client to create as many types of locks as it wants and clients can give meanings to them as they want. Scalable.
- All the logic related to locking and unlocking are in one place e.g.: the lock class. Encapsulation.
- The lock module only knows how to do two things. Locs and unlock. It doesn’t know what is locking and unlocking. Also, the tasks related to lock/unlock action are the responsibility of the clients. Single Responsibility.
- There is a strict line between the lock module and its clients. Clients don’t know the logic of the lock unlock mechanism and the lock module doesn’t know anything about the client. Separation of concerns.

It seems the design has achieved all the stated design goals and use cases. But is it enough !!

**So now what more the design can provide:**

- The lock module can add an owner and password system to verify the clients.
- Going one step further the lock module can add security for each lock using the owner ID, and password.
- It can provide a platform for clients to maintain their clients in the lock module. And those secondary clients can have specific permission for specific locks given by the primary clients.
- The lock module can provide a scheduling system.

The possibilities are endless. In this way, the lock module can become enterprise software by itself. And maintaining those design principles made all these possible.

But what are the drawbacks? **All designs have trade-offs.**

- Who is going to keep track of who is locking and unlocking, in general, the user ID of the clients? There are two solutions. The first one is obvious: clients will keep track of it. But it might break the DRY principle in the case of monolith but de facto choice in the case of microservices. Second, is the secondary client system mentioned above. The additional complexity and coding might not be warranted in most cases. So the compromise is that the lock module will provide a generic field whose data integrity and interpretation belongs to the client. It is not elegant but it is a trade-off.
- The same goes for authorization or any other hierarchy that needs to be maintained. One example would be an office management system where files need multiple and ordered permissions to be unlocked. This can be done by the client submodule of the lock module.
- Chain lock system. Locks need to be opened or closed in a particular order. This certainly should be the responsibility of the client. But if we want to add it to the lock module we can either add another class that stores the parent lock and their expected status or we can create a policy system.

These are some of the issues and how to address them. Another thing to notice is that we did not need to modify the existing design, only extended it with new fields or classes. Thus preserving OCP.

### Key takeaways:

- Keep our eyes open. Take inspiration from the real world. Because it had thousands of years of experience and physical constraints to be modular.
- Ignorance is bliss. Less we know who is going to use your module better.
- Better to learn from other mistakes. We should try to maintain software principles like Encapsulation, DRY, SRP, and Separation of concerns. Developers who invented them had already crossed the muddy water.
- Always have a plan. Our main job is the plan, not the code.

This design has many flaws and certainly, my explanation has many logical flaws. I welcome all constructive criticism.On a final note, maintaining software principles might seem like a pain and it certainly is. In the real world, we might need to break them and we certainly do. But keeping them as our underlying guiding principles and striving towards achieving them is what differentiates between experienced and novice software engineers.

Project link: <https://github.com/Bitaron/Lock-Module>
