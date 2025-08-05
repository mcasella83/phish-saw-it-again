import React, { useState, useEffect } from "react";
import { getRandomShow, getAllShowDates } from "@/lib/phish-api";
import { PhishShow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Loader2, Trophy, Calendar, MapPin, RefreshCw } from "lucide-react";

interface GameState {
  currentShow: PhishShow | null;
  guesses: string[]; // Store date strings
  hints: string[];
  gameOver: boolean;
  score: number | null;
  isLoading: boolean;
  error: string | null;
  allShowDates?: string[]; // Available show dates for slider
}

// Phish timeline constants
const PHISH_START_YEAR = 1983;
const PHISH_CURRENT_YEAR = new Date().getFullYear();

export default function DateGuessGame() {
  const [gameState, setGameState] = useState<GameState>({
    currentShow: null,
    guesses: [],
    hints: [],
    gameOver: false,
    score: null,
    isLoading: false,
    error: null,
    allShowDates: [],
  });
  const [currentGuess, setCurrentGuess] = useState([0]); // Index in allShowDates array
  const [allShowDates, setAllShowDates] = useState<string[]>([]);

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

  const loadAllShowDates = async () => {
    try {
      console.log("Loading all show dates...");
      const dates = await getAllShowDates();
      console.log(`Loaded ${dates.length} show dates`);
      setAllShowDates(dates);
      // Set initial guess to middle of timeline
      setCurrentGuess([Math.floor(dates.length / 2)]);
    } catch (error) {
      console.error("Failed to load show dates:", error);
      setGameState(prev => ({ 
        ...prev, 
        error: "Failed to load show dates. Please try refreshing the page." 
      }));
    }
  };

  useEffect(() => {
    loadAllShowDates();
    loadRandomShow();
  }, []);

  const calculateDaysDifference = (guessDate: string, actualDate: string): number => {
    const guess = new Date(guessDate);
    const actual = new Date(actualDate);
    return Math.abs(Math.floor((guess.getTime() - actual.getTime()) / (1000 * 60 * 60 * 24)));
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
    const daysDiff = Math.abs(Math.floor((guessDate.getTime() - actualDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (guessDate.getTime() === actualDate.getTime()) {
      return "🎯 Exact date! Perfect!";
    } else if (daysDiff <= 7) {
      return guessDate < actualDate ? "📈 Very close! Just a few days later!" : "📉 Very close! Just a few days earlier!";
    } else if (daysDiff <= 30) {
      return guessDate < actualDate ? "📈 Close! About a month later." : "📉 Close! About a month earlier.";
    } else if (daysDiff <= 90) {
      return guessDate < actualDate ? "📈 Getting warmer! A few months later." : "📉 Getting warmer! A few months earlier.";
    } else if (daysDiff <= 365) {
      return guessDate < actualDate ? "� Within a year! Several months later." : "📉 Within a year! Several months earlier.";
    } else {
      return guessDate < actualDate ? "📈 Much later! Keep going forward." : "📉 Much earlier! Keep going back.";
    }
  };

  const submitGuess = () => {
    if (currentGuess.length === 0 || !gameState.currentShow || allShowDates.length === 0) return;

    const guessIndex = currentGuess[0];
    const guessDate = allShowDates[guessIndex];
    
    if (!guessDate) {
      setGameState(prev => ({ 
        ...prev, 
        error: "Invalid date selection" 
      }));
      return;
    }

    const actualDate = gameState.currentShow.showdate;
    const daysDifference = calculateDaysDifference(guessDate, actualDate);
    const hint = getHint(guessDate, actualDate);
    
    const newGuesses = [...gameState.guesses, guessDate];
    const newHints = [...gameState.hints, hint];
    
    // Check if it's exact or if they've used all 5 guesses
    const isExact = daysDifference === 0;
    const isGameOver = isExact || newGuesses.length >= 5;
    
    setGameState(prev => ({
      ...prev,
      guesses: newGuesses,
      hints: newHints,
      gameOver: isGameOver,
      score: isGameOver ? daysDifference : null,
      error: null
    }));
    
    // Don't reset currentGuess to preserve slider position
  };

  const getScoreMessage = (score: number): string => {
    if (score === 0) return "🏆 PERFECT! You got the exact date!";
    if (score <= 7) return "🎉 Excellent! Within a week!";
    if (score <= 30) return "👍 Great! Within a month!";
    if (score <= 90) return "📅 Good! Within 3 months!";
    if (score <= 365) return "📆 Not bad! Within a year!";
    return "🗓️ Keep practicing!";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Calendar className="h-6 w-6" />
            Phish Date Guessing Game
          </CardTitle>
          <CardDescription>
            Can you guess when this show happened? Use the slider to select from actual Phish show dates. You get 5 guesses and hints along the way!
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

            {/* Setlist Display */}
            {gameState.currentShow.setlist && gameState.currentShow.setlist.length > 0 && (
              <div className="border rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold mb-3 text-center">🎵 Setlist (Your Clue!)</h3>
                <div className="overflow-x-auto overflow-y-hidden pb-2" style={{scrollbarWidth: 'thin'}}>
                  {(() => {
                    // Group songs by set
                    const songsBySet = gameState.currentShow.setlist.reduce((acc: any, song: any) => {
                      const setName = song.set || '1';
                      if (!acc[setName]) acc[setName] = [];
                      acc[setName].push(song);
                      return acc;
                    }, {});

                    // Sort sets (Set 1, Set 2, Set 3, Encore, etc.)
                    const setOrder = ['1', '2', '3', '4', 'E', 'E2', 'E3'];
                    const sortedSets = Object.keys(songsBySet).sort((a, b) => {
                      const aIndex = setOrder.indexOf(a);
                      const bIndex = setOrder.indexOf(b);
                      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
                      if (aIndex === -1) return 1;
                      if (bIndex === -1) return -1;
                      return aIndex - bIndex;
                    });

                    return (
                      <div className="flex gap-6 min-w-fit pb-2">
                        {sortedSets.map((setName) => (
                          <div key={setName} className="flex-shrink-0 min-w-[240px] max-w-[300px]">
                            <h4 className="font-medium text-sm mb-2 text-primary text-center border-b pb-1">
                              {setName === 'E' ? 'Encore' : 
                               setName === 'E2' ? 'Encore 2' :
                               setName === 'E3' ? 'Encore 3' :
                               `Set ${setName}`}
                            </h4>
                            <div className="space-y-1">
                              {songsBySet[setName].map((song: any, index: number) => (
                                <div key={index} className="text-sm">
                                  <div className="font-medium">{song.song}</div>
                                  {song.songnotes && (
                                    <div className="text-xs text-muted-foreground italic">
                                      {song.songnotes}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {!gameState.gameOver && (
              <div className="space-y-4">
                <div className="text-center text-sm text-muted-foreground">
                  Guess {gameState.guesses.length + 1} of 5
                </div>
                {allShowDates.length === 0 ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading show dates...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-center text-sm font-medium">
                        Selected Date: {allShowDates[currentGuess[0]] ? formatDate(allShowDates[currentGuess[0]]) : "Loading..."}
                      </div>
                      <Slider
                        value={currentGuess}
                        onValueChange={setCurrentGuess}
                        max={allShowDates.length - 1}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{allShowDates[0] ? formatDate(allShowDates[0]) : ""}</span>
                        <span>{allShowDates[allShowDates.length - 1] ? formatDate(allShowDates[allShowDates.length - 1]) : ""}</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button 
                        onClick={submitGuess}
                        disabled={allShowDates.length === 0}
                      >
                        Guess
                      </Button>
                    </div>
                  </div>
                )}
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

                {/* Show complete setlist when game is over */}
                {gameState.currentShow.setlist && gameState.currentShow.setlist.length > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h3 className="font-semibold mb-3 text-center">🎵 Complete Setlist</h3>
                    <div className="overflow-x-auto overflow-y-hidden pb-2" style={{scrollbarWidth: 'thin'}}>
                      {(() => {
                        // Group songs by set
                        const songsBySet = gameState.currentShow.setlist.reduce((acc: any, song: any) => {
                          const setName = song.set || '1';
                          if (!acc[setName]) acc[setName] = [];
                          acc[setName].push(song);
                          return acc;
                        }, {});

                        // Sort sets (Set 1, Set 2, Set 3, Encore, etc.)
                        const setOrder = ['1', '2', '3', '4', 'E', 'E2', 'E3'];
                        const sortedSets = Object.keys(songsBySet).sort((a, b) => {
                          const aIndex = setOrder.indexOf(a);
                          const bIndex = setOrder.indexOf(b);
                          if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
                          if (aIndex === -1) return 1;
                          if (bIndex === -1) return -1;
                          return aIndex - bIndex;
                        });

                        return (
                          <div className="flex gap-6 min-w-fit pb-2">
                            {sortedSets.map((setName) => (
                              <div key={setName} className="flex-shrink-0 min-w-[240px] max-w-[300px]">
                                <h4 className="font-medium text-sm mb-2 text-primary text-center border-b pb-1">
                                  {setName === 'E' ? 'Encore' : 
                                   setName === 'E2' ? 'Encore 2' :
                                   setName === 'E3' ? 'Encore 3' :
                                   `Set ${setName}`}
                                </h4>
                                <div className="space-y-1">
                                  {songsBySet[setName].map((song: any, index: number) => (
                                    <div key={index} className="text-sm">
                                      <div className="font-medium">{song.song}</div>
                                      {song.songnotes && (
                                        <div className="text-xs text-muted-foreground italic">
                                          {song.songnotes}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
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
