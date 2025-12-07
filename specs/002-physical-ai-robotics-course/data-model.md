# Data Model: Physical AI & Humanoid Robotics Course

## Overview

This document outlines the data model for the "Physical AI & Humanoid Robotics" course. As this is a content-focused feature, the data model primarily describes the structure of the content.

## Entities

-   **Course**: Represents the entire "Physical AI & Humanoid Robotics" course.
    -   **Attributes**:
        -   Title
        -   Focus and Theme
        -   Goal
-   **Module**: A logical grouping of course content.
    -   **Attributes**:
        -   Title
        -   Focus
-   **Week**: A weekly breakdown of the course content.
    -   **Attributes**:
        -   Title
        -   Topics
-   **Section**: A specific topic within a week.
    -   **Attributes**:
        -   Title
        -   Content (Markdown)
