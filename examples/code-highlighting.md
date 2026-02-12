---
slides: true
theme: academic
---

# Code Highlighting

Line numbers, static highlights, and **dynamic walk-throughs**

---

## Line Numbers

```typescript {lines}
interface Student {
  name: string;
  grade: number;
  enrolled: boolean;
}

function getHonorRoll(students: Student[]): string[] {
  return students
    .filter(s => s.enrolled && s.grade >= 90)
    .map(s => s.name);
}
```

---

## Static Highlights

```typescript {lines,1,3-5}
interface Student {
  name: string;
  grade: number;
  enrolled: boolean;
}

function getHonorRoll(students: Student[]): string[] {
  return students
    .filter(s => s.enrolled && s.grade >= 90)
    .map(s => s.name);
}
```

Lines 1, 3–5 are always highlighted

---

## Dynamic Highlights

Click or press arrow keys to step through:

```typescript {lines,1-5|8-11|*}
interface Student {
  name: string;
  grade: number;
  enrolled: boolean;
}

function getHonorRoll(students: Student[]): string[] {
  return students
    .filter(s => s.enrolled && s.grade >= 90)
    .map(s => s.name);
}
```

---
fragments: true
---

## Mixed Fragments

- First, define the data model
- Then, implement the logic

```python {1-4|6-8}
@dataclass
class Course:
    title: str
    credits: int

def total_credits(courses: list[Course]) -> int:
    """Calculate total credits."""
    return sum(c.credits for c in courses)
```

---

## Python with Line Numbers

```python {lines}
from dataclasses import dataclass
from typing import Optional

@dataclass
class Course:
    title: str
    credits: int
    professor: Optional[str] = None

def total_credits(courses: list[Course]) -> int:
    """Calculate total credits across all courses."""
    return sum(c.credits for c in courses)

fall_semester = [
    Course("Algorithms", 3, "Knuth"),
    Course("Linear Algebra", 4),
]

print(f"Total: {total_credits(fall_semester)} credits")
```

---

## Inline Code

Use `getHonorRoll()` to filter by grade threshold.

The `@dataclass` decorator generates `__init__` and `__repr__` automatically.

A `boolean` value like `true` or `false` controls enrollment status.
