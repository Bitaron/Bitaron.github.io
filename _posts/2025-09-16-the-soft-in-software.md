---
title: "The Soft in Software"
date: 2025-09-16 16:51:04 +0000
image: "/assets/images/posts/the-soft-in-software.jpg"
tags:
  - Software Architecture
  - Software Development
  - Software
  - Software Engineering
external_url: "https://medium.com/@bitaron90/the-soft-in-software-0abc7fbe1a45"
excerpt: >-
  Why software should remain adaptable rather than become rigid like hardware,
  and how architectural decisions preserve the “soft” quality that makes change
  practical.
---

> Originally published on [Medium](https://medium.com/@bitaron90/the-soft-in-software-0abc7fbe1a45).


Software and hardware are two words that shape every developer’s daily work. While “hardware” represents the physical, tangible components of a computer system, the term “software” implies something malleable, changeable, and adaptable. But what exactly makes software “soft”? And why do we so often end up with rigid, hard-to-modify systems that behave more like hardware?

### **The Theory of Softness**

Robert C. Martin, in his seminal work “Clean Architecture,” states: The second value of software has to do with the word “software” — a compound word composed of “soft” and “ware.” The word “ware” means “product”; the word “soft”… Well, that’s where the second value lies. Software was invented to be “soft.” It was intended to be a way to easily change the behavior of machines. If we’d wanted the behavior of machines to be hard to change, we would have called it hardware.

In the classical text *Software Paradigms: Programming Paradigms Perspective* (2005), Stephen H. Kaisler explicitly discusses why software is inherently *“soft.”* He notes that: *Software is soft in a number of ways. It is not visible when it is running. It seems to change all the time, both when it is running and when it is being built.*

But consider this: How many times have we faced a situation where a costly rewrite was necessary due to rigid design? Think about a scenario where our team has to overhaul the entire codebase just to add a new feature or accommodate a slight change in business logic. ​

### **A Real-World Case Study: Document Approval System**

Consider a scenario where we’re building accounting software that requires payment slips to be approved by an ACAFO (Assistant Chief Accounts and Finance Officer) and CAFO (Chief Accounts and Finance Officer). Our system consists of three components: frontend, backend, and database.

#### **Approach 1 — The Hardware-ish design**

#### Database design:

```
payment_slips table:
- payment_slip_id
- ACAFO_approval (boolean)
- CAFO_approval (boolean)
```

#### API design:

```
approveACAFO(paymentSlipId)
approveCAFO(paymentSlipId)
```

- This approach seems simple and direct, but it’s essentially creating software hardware.
- The approval authorities are hardcoded into the database schema itself. If we need to add another approver to the chain, we must modify the database structure and create new API endpoints.
- If another document type requires approval, we will need entirely separate tables and APIs.
- This design violates the principle of software softness because it treats data (approval authorities) as structural elements(database column) rather than dynamic information(database column value).

#### **Approach 2: Slight Improvement (Reduced Column Dependency)**

Let’s refine our approach:

#### **Database Design:**

```
payment_slips table:
- payment_slip_id
- approved_by (enum: ACAFO, CAFO)
```

#### **API Design:**

```
approveACAFO(paymentSlipId)
approveCAFO(paymentSlipId)
```

- This approach eliminates the need for multiple approval columns, but we still hardcode the business logic into our API functions.
- Adding new approvers still requires code changes, and supporting different document types still demands separate implementations.

#### **Approach 3: Embracing Abstraction (Improved Softness)**

Now let’s think more abstractly:

#### **Database Design:**

```
documents table:
- document_id
- document_type
​
approvals table:
- document_id
- approved_by (enum: ACAFO, CAFO, …)
```

**API Design:**

```
approve(documentId, approvedBy)
```

- This design introduces significant improvements. Our database schema no longer assumes specific approval authorities, and our API becomes generic.
- We can easily add new approvers and extend the system to handle different document types without structural changes.

#### **Approach 4: Enhanced Flexibility (**Extensible Softness**)**

Let’s push the concept further to unlock true power of software softness:

#### **Database Design:**

```
documents table:
- document_id
- document_type
​
document_approval_chains table:
- document_type_id
- approval_authority
- order_sequence
​
approvals table:
- document_id
- approved_by
- approval_timestamp
```

**API Design:**

```
approve(documentId, approvedBy)
```

- The API now validates approval sequences dynamically based on the document type’s defined approval chain.
- This final approach achieves true softness by making approval chains completely data-driven.
- Users can dynamically define approval authorities for different document types without any code changes.
- The system behavior is determined by data configuration rather than hardcoded logic.

### Understanding the Spectrum of Specificity

A common concern all developers have is that software needs to be specific to be useful. After all, we can’t accomplish anything with pure abstraction. This observation is partially correct, but it misses a crucial point about where that specificity should reside.

Looking at our four approaches:

![The Soft in Software illustration](/assets/images/medium/the-soft-in-software-01.png)

The key insight is that software must indeed be specific, but as developers, we should push that specificity as far toward the outer layers as possible, following the order: Frontend → Backend → Database.

### The Economics of Change

Why does this layered approach to specificity matter? The answer lies in the relative costs of making changes at different levels of the system. Frontend changes are typically the least costly to implement, while database schema modifications are the most expensive, often requiring complex migration strategies and system downtime. Industry experience and reports suggest that changes at the data/schema layer are often *far more expensive* than equivalent changes in application logic — sometimes several times more, especially when they involve schema migrations, data migration, and coordination across many services.

### Conclusion: Let Software Be Soft

The essence of good software design lies in honoring software’s fundamental nature: its softness. When we create rigid, inflexible systems, we’re working against the very characteristic that makes software powerful: its ability to change and adapt.

We should always remember that software that cannot change is no longer software — it has become hardware. And in a world where change is the only constant, rigid software is destined for obsolescence.

The next time we are designing a system, ask ourselves: “Am I creating software or hardware?” The answer will guide you toward more maintainable, adaptable, and truly soft solutions.

A comic strip to end :

![The Soft in Software illustration](/assets/images/medium/the-soft-in-software-02.png)
