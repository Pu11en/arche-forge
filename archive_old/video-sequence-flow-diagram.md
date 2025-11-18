# Video Sequence Flow Diagram

```mermaid
graph TD
    A[App Component Loads] --> B[LoadingOverlay with Intro Video]
    B --> C[Intro Video Plays Once]
    C --> D[Intro Video Ends]
    D --> E[Transition to VideoSequence Component]
    
    E --> F[Bull Video Starts Looping]
    F --> G[Trademark Phrase Rotation Begins]
    G --> H[Phrases Rotate Every 1.5s]
    
    F --> I[2 Second Timer Starts]
    I --> J[Timer Completes]
    J --> K[Heading Fades In]
    J --> L[CTA Button Fades In]
    
    H --> M[Continue Phrase Rotation]
    M --> H
    
    K --> N[User Sees Complete Scene]
    L --> N
    
    N --> O[User Clicks CTA]
    O --> P[Navigate to Main Content]
```

## Component Hierarchy

```
App
├── LoadingOverlay (Intro Video)
└── VideoSequence
    ├── LoopingVideo (Bull Video)
    ├── TrademarkPhraseOverlay
    └── HeadingWithCTA
        ├── Heading
        └── CTA Button
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> LoadingIntro
    LoadingIntro --> PlayingIntro: Video Ready
    PlayingIntro --> Transitioning: Video Ends
    Transitioning --> PlayingLoop: Transition Complete
    PlayingLoop --> ShowingPhrases: Video Starts
    ShowingPhrases --> RotatingPhrases: Start Rotation
    RotatingPhrases --> RotatingPhrases: Every 1.5s
    PlayingLoop --> WaitingForHeading: 2s Timer
    WaitingForHeading --> ShowingContent: Timer Complete
    ShowingContent --> [*]: User Clicks CTA
```

## Timing Sequence

```
Time (s) | Component          | Action
---------|-------------------|-----------------------------------------
0.0      | LoadingOverlay     | Intro video starts playing
?        | LoadingOverlay     | Intro video ends (varies by video length)
0.0      | VideoSequence      | Bull video starts looping
0.0      | PhraseOverlay      | First phrase appears
1.5      | PhraseOverlay      | Second phrase (fade transition)
3.0      | PhraseOverlay      | Third phrase (fade transition)
...      | PhraseOverlay      | Continue rotating every 1.5s
2.0      | HeadingWithCTA     | Heading and CTA fade in together
```

## Responsive Breakpoints

```mermaid
graph LR
    A[Mobile < 768px] --> B[Phrase: 16px]
    A --> C[Heading: 24px]
    A --> D[CTA: 14px]
    
    E[Tablet 768-1024px] --> F[Phrase: 18px]
    E --> G[Heading: 32px]
    E --> H[CTA: 16px]
    
    I[Desktop > 1024px] --> J[Phrase: 20px]
    I --> K[Heading: 40px]
    I --> L[CTA: 18px]