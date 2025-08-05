import React, { useState, useEffect } from "react";
import { getRandomShow } from "@/lib/phish-api";
import { PhishShow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Calendar, MapPin, RefreshCw } from "lucide-react";

interface GameState {
  currentShow: PhishShow | null;
  guesses: string[];
  hints: string[];
  gameOver: boolean;
  score: number | null;
  isLoading: boolean;
  error: string | null;
}

export default function DateGuessGame() {
  const [gameState, setGameState] = useState<GameState>({
    currentShow: null,
    guesses: [],
    hints: [],
    gameOver: false,
    score: null,
    isLoading: false,
    error: null,
  });
  const [currentGuess, setCurrentGuess] = useState("");

  const loadRandomShow = async () => {
    setGameState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      currentShow: null,
      guesses: [],
      hints: [],
      gameOver: false,
      score: null
    }));
    
    try {
      const show = await getRandomShow();
      setGameState(prev => ({ 
        ...prev, 
        currentShow: show, 
        isLoading: false 
      }));
    } catch (error) {
      setGameState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "Failed to load show", 
        isLoading: false 
      }));
    }
  };

  useEffect(() => {
    loadRandomShow();
  }, []);

  const calculateDaysDifference = (guess: string, actual: string): number => {
    const guessDate = new Date(guess);
    const actualDate = new Date(actual);
    return Math.abs(Math.floor((guessDate.getTime() - actualDate.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getHint = (guess: string, actual: string): string => {
    const guessDate = new Date(guess);
    const actualDate = new Date(actual);
    
    if (guessDate.getTime() === actualDate.getTime()) {
      return "🎯 Exact match! Perfect!";
    } else if (guessDate < actualDate) {
      return "📈 Higher! The show was later than your guess.";
    } else {
      return "📉 Lower! The show was earlier than your guess.";
    }
  };

  const submitGuess = () => {
    if (!currentGuess || !gameState.currentShow) return;

    const guess = currentGuess.trim();
    const guessDate = new Date(guess);
    
    // Validate date format
    if (isNaN(guessDate.getTime())) {
      setGameState(prev => ({ 
        ...prev, 
        error: "Please enter a valid date (YYYY-MM-DD format)" 
      }));
      return;
    }

    const actualDate = gameState.currentShow.showdate;
    const daysDifference = calculateDaysDifference(guess, actualDate);
    const hint = getHint(guess, actualDate);
    
    const newGuesses = [...gameState.guesses, guess];
    const newHints = [...gameState.hints, hint];
    
    // Check if it's exact or if they've used both guesses
    const isExact = daysDifference === 0;
    const isGameOver = isExact || newGuesses.length >= 2;
    
    setGameState(prev => ({
      ...prev,
      guesses: newGuesses,
      hints: newHints,
      gameOver: isGameOver,
      score: isGameOver ? daysDifference : null,
      error: null
    }));
    
    setCurrentGuess("");
  };

  const getScoreMessage = (score: number): string => {
    if (score === 0) return "🏆 PERFECT! You got the exact date!";
    if (score <= 7) return "🎉 Excellent! Within a week!";
    if (score <= 30) return "👍 Great! Within a month!";
    if (score <= 90) return "📅 Good! Within 3 months!";
    if (score <= 365) return "📆 Not bad! Within a year!";
    return "🗓️ Keep practicing!";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitGuess();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Calendar className="h-6 w-6" />
            Phish Date Guessing Game
          </CardTitle>
          <CardDescription>
            Can you guess when this show happened? You get 2 guesses and hints along the way!
          </CardDescription>
        </CardHeader>
      </Card>

      {gameState.error && (
        <Alert variant="destructive">
          <AlertDescription>{gameState.error}</AlertDescription>
        </Alert>
      )}

      {gameState.isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading random show...</span>
          </CardContent>
        </Card>
      )}

      {gameState.currentShow && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mystery Show
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold">{gameState.currentShow.venue}</div>
              <div className="text-muted-foreground">{gameState.currentShow.location}</div>
              {gameState.currentShow.rating > 0 && (
                <Badge variant="secondary">
                  Rating: {gameState.currentShow.rating.toFixed(1)}/5
                </Badge>
              )}
            </div>

            {!gameState.gameOver && (
              <div className="space-y-4">
                <div className="text-center text-sm text-muted-foreground">
                  Guess {gameState.guesses.length + 1} of 2
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={currentGuess}
                    onChange={(e) => setCurrentGuess(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="YYYY-MM-DD"
                    className="flex-1"
                  />
                  <Button 
                    onClick={submitGuess}
                    disabled={!currentGuess.trim()}
                  >
                    Guess
                  </Button>
                </div>
              </div>
            )}

            {gameState.guesses.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Your Guesses:</h3>
                {gameState.guesses.map((guess, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Guess {index + 1}:</span>
                      <span>{formatDate(guess)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {gameState.hints[index]}
                    </div>
                    {gameState.gameOver && (
                      <div className="text-sm">
                        <strong>Difference:</strong> {calculateDaysDifference(guess, gameState.currentShow!.showdate)} days
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {gameState.gameOver && (
              <div className="space-y-4 border-t pt-4">
                <div className="text-center space-y-2">
                  <div className="text-lg font-semibold">Game Over!</div>
                  <div className="text-xl font-bold text-primary">
                    Actual Date: {formatDate(gameState.currentShow.showdate)}
                  </div>
                  <div className="text-lg">
                    Your Score: <span className="font-bold">{gameState.score} days off</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getScoreMessage(gameState.score!)}
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button onClick={loadRandomShow} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Play Again
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
