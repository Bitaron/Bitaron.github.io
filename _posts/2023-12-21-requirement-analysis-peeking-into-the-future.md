---
title: "Requirement Analysis: Peeking into the Future"
date: 2023-12-21 12:58:16 +0000
image: "/assets/images/posts/requirement-analysis-peeking-into-the-future.jpg"
tags:
  - Software Development
  - Committee Module
  - Software Architecture
  - Software Engineering
external_url: "https://medium.com/@bitaron90/requirement-analysis-peeking-into-the-future-5264aad8d3b7"
excerpt: >-
  Turn abstract requirements into concrete software design through a practical
  education-system example that moves from client needs to a tabulation-committee
  module.
---

> Originally published on [Medium](https://medium.com/@bitaron90/requirement-analysis-peeking-into-the-future-5264aad8d3b7).


![Requirement Analysis: Peeking into the Future illustration](/assets/images/medium/requirement-analysis-peeking-into-the-future-01.png)

**Software development** is an adventure filled with anxiety, hardship, and sleepless nights, all intertwined with occasional delight. We, the developers, start this journey by fixing our goal: ***What to build***. Requirement analysis is the process that helps us to determine that goal. However, requirements are abstract, incomplete, and subject to change. Clients may not know what they want. As a result, we tend to overlook it and dive straight into other aspects of software development.

**In this article,** I will go through a practical example of requirement analysis. The goal is to flesh out concrete design from abstract requirements. Our team is working on an education management system. At one point we came across a requirement for a tabulation committee. **The requirements from the clients are:**

1. Can create a tabulation committee
2. Committee members can create and approve tabulations.

The EMS will need various kinds of committees to function. Another example would be a disciplinary committee that takes action against students. So we should try to list some of the committees and their details. We might not know all of them, but having a few concrete examples will help us visualize better.

![Requirement Analysis: Peeking into the Future illustration](/assets/images/medium/requirement-analysis-peeking-into-the-future-02.jpg)

If we do not treat tabulators as members of the tabulation committee, then all the committees have the same structure. We should try to find examples of other kinds of structures. On further exploration, we found the following types of committees from another university:

![Requirement Analysis: Peeking into the Future illustration](/assets/images/medium/requirement-analysis-peeking-into-the-future-03.jpg)

**As the examples show,** we can not be rigid about committee structures. Clients should have the flexibility to create and modify them. So a template system needs to be created.

**The next issue is committee actions**. For that, we need to answer three questions:

1. What actions it can take
2. Who can take it
3. When can actions be taken

Let us go back to the examples. We have fleshed out the actions. From there, we can see committees each have their unique actions. It might be hard to generalize them. So we will leave the specific details of the actions and time of actions to the client.

![Requirement Analysis: Peeking into the Future illustration](/assets/images/medium/requirement-analysis-peeking-into-the-future-04.jpg)

**What about who can take which action?** In the tabulation committee case, the tabulation module will ask the committee module which member can generate tabulation. Or can this member approve the tabulation? Based on these answers, the tabulation module will generate or approve tabulation. We will keep this information with the committee module. However, the committee module does not take any action, e.g.: Generate tabulation, Approve tabulation. So actions and the committee module need to be loosely coupled. **Main things to notice here:**

1. The client, in this case, the tabulation module executes the action. The committee module does not know how or when the actions are executed.
2. The committee module only knows which members are eligible to do which task. But those tasks themselves have no meaning to the committee module.

**With these in mind,** we can treat actions as tags given to specific members by the clients. Maintenance and interpretation solely depend on the clients. This will make the committee module loosely coupled and easier to maintain.

**The next issue is maintaining order.** There can be three types of precedence:

1. View order
2. Task order
3. Member precedence in task execution

***View order*** means how the user will see the list of the committee members. Will the chairman’s name be shown first or will it be shown last? This responsibility belongs to the committee module.

***Task order*** means the order of the tasks, e.g.: first need to create tabulation then approve it. This responsibility belongs to the client modules.

***The third order refers to committee member’s precedence in task execution.*** For example, if member one has created a tabulation then member two and three can not create it again. Member Three’s approval is needed before Member Two can approve. As we have equated tasks with tags, we can equate this order as a weight to each tag. The clients can use these weighted tags as they like.

These were all the issues we needed to address. The Committee module will be responsible for committee structures, members, and responsibilities with precedence. The clients will handle the execution of the responsibilities.

**Now we will discuss the implementation.** I will not go through the details of implementation and will only discuss the key issues:

- *How much personal information should the committee keep for its members?*

Committee member’s attributes change and evolve. The assistant professor on the tabulation committee in 2020 might be an Associate professor in 2024. But he should be designated as an assistant professor in the tabulation committee of 2020 all the time. These attributes are not finite. So we will not keep any specific attributes of a user. We will only keep his display name, generic user identifier, and timestamp.

- *How should we store history for various entities e.g: template, committee, member, etc?*

We will maintain the template, and member histories using timestamps and user identifiers. The committee itself has many statuses and will have a different history table.

- *How to store action? Do we need to keep the action history?*

We will have a different table where action applicable to each committee member is stored. The committee module will not do any validation on these action types. The committee module can provide an action history table and API for the clients to store who and when. The clients are responsible for maintaining and interpreting the data.

**The class diagram:**

![Requirement Analysis: Peeking into the Future illustration](/assets/images/medium/requirement-analysis-peeking-into-the-future-05.jpg)

**The important thing to notice** here is the empty class operation sections.The committee module is purely a data holder module. It does not provide much operation to its clients(except the generic CRUD methods).

This concludes our design for the requirements we got at the beginning. With this hopefully, the EMS can build any committee it wants with minimum effort.

### **What we got from this design:**

- We have a core module that we will use to create more concrete modules.
- It is not dependent on specific requirements, so it is reusable for other projects.
- It maintains all the principles of software design.
- We can extend this design to a full-fledged microservice.

***Should we generalize the committee actions also?*** On top of my head, I can think of doing it by following:

- We can use an in-memory database to map actions and their implementations.
- We can use a policy system to manage various conditions to execute these actions.

***Do we need it?*** I do not think so. It complicates the existing simple design. There is no guarantee that this can satisfy all types of actions of different committees. It is better to create separate tabulation, exam, and treasury modules that use the committee module to create their committees. These upper-level modules control the execution of their actions. This makes the design simple and easy to understand.

### **Key takeaways:**

- Breathe. Whenever new requirements come we should not jump to implementation with the first design that pops into our head. We should stop, think, and give time to mature the design.
- Visualize the data. Most of the requirements are in abstract form. We should create multiple concrete examples to understand what is required. Tables, charts, and UML diagrams are suitable tools for it.
- Look elsewhere. We should collect examples not only from the current domain but also from different entities and domains. It will provide different perspectives on the requirements.
- Generalize. We should remember the quote: “It should be noted that no ethically-trained software engineer would ever consent to write a DestroyBaghdad procedure. Basic professional ethics would instead require him to write a DestroyCity procedure, to which Baghdad could be given as a parameter”.
- Do not over-generalize. We should always ask while making a decision: Does it make the design simple or complex?

**To us computer folks,** requirement analysis seems tedious work. We are more excited about diving into code, and it also pleases the stakeholders to have something tangible. But our impulses and the looming deadlines should not sway us. We should give requirement analysis proper due. Statistics show that good requirement analysis cuts the development time significantly. When requirements are well-defined, it reduces stress on developers. They can focus more on technical issues.

### ***So we should remember when working on new requirements: take a step back, breathe, and methodically build up to the design.***
