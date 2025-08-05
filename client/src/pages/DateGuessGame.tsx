import React, { useState, useEffect } from "react";
import { getRandomShow, getAllShowDates } from "@/lib/phish-api";
import { PhishShow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Trophy, Calendar, MapPin, RefreshCw } from "lucide-react";

interface GameState {
  currentShow: PhishShow | null;
  guesses: string[]; // Store date strings
  hints: string[];
  gameOver: boolean;
  score: number | null;
  isLoading: boolean;
  error: string | null;
}

const DateGuessGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentShow: null,
    guesses: [],
    hints: [],
    gameOver: false,
    score: null,
    isLoading: false,
    error: null,
  });

  const [allShowDates, setAllShowDates] = useState<string[]>([]);
  const [selectedDateValue, setSelectedDateValue] = useState<number[]>([0]);
  const [manualDateInput, setManualDateInput] = useState<string>("");

  const maxGuesses = 5;

  // Load all show dates for the slider
  useEffect(() => {
    const loadShowDates = async () => {
      try {
        const dates = await getAllShowDates();
        setAllShowDates(dates);
      } catch (error) {
        console.error("Failed to load show dates:", error);
      }
    };
    loadShowDates();
  }, []);

  // Convert slider value to date and vice versa
  const getDateFromSliderValue = (value: number): string => {
    if (allShowDates.length === 0) return "";
    const index = Math.min(Math.max(0, Math.round(value)), allShowDates.length - 1);
    return allShowDates[index];
  };

  const getSliderValueFromDate = (date: string): number => {
    const index = allShowDates.indexOf(date);
    return index >= 0 ? index : 0;
  };

  const loadRandomShow = async () => {
    setGameState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const show = await getRandomShow();
      setGameState(prev => ({
        ...prev,
        currentShow: show,
        guesses: [],
        hints: [],
        gameOver: false,
        score: null,
        isLoading: false,
      }));
      
      // Reset slider to middle position
      if (allShowDates.length > 0) {
        setSelectedDateValue([Math.floor(allShowDates.length / 2)]);
      }
      setManualDateInput("");
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load show",
      }));
    }
  };

  const submitGuess = (guessDate: string) => {
    if (!gameState.currentShow || gameState.gameOver || !guessDate) return;

    const newGuesses = [...gameState.guesses, guessDate];
    const correctDate = gameState.currentShow.showdate;
    
    if (guessDate === correctDate) {
      // Correct guess!
      const score = Math.max(1, maxGuesses - newGuesses.length + 1);
      setGameState(prev => ({
        ...prev,
        guesses: newGuesses,
        gameOver: true,
        score,
      }));
    } else if (newGuesses.length >= maxGuesses) {
      // Out of guesses
      setGameState(prev => ({
        ...prev,
        guesses: newGuesses,
        gameOver: true,
        score: 0,
      }));
    } else {
      // Wrong guess, provide hint
      const hint = getDateHint(guessDate, correctDate);
      setGameState(prev => ({
        ...prev,
        guesses: newGuesses,
        hints: [...prev.hints, hint],
      }));
    }
  };

  const getDateHint = (guess: string, correct: string): string => {
    const guessDate = new Date(guess);
    const correctDate = new Date(correct);
    const diffTime = guessDate.getTime() - correctDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      if (diffDays > 365) {
        return `Too late! Try ${Math.floor(diffDays / 365)} year(s) earlier.`;
      } else if (diffDays > 30) {
        return `Too late! Try ${Math.floor(diffDays / 30)} month(s) earlier.`;
      } else {
        return `Too late! Try ${diffDays} day(s) earlier.`;
      }
    } else {
      const absDiffDays = Math.abs(diffDays);
      if (absDiffDays > 365) {
        return `Too early! Try ${Math.floor(absDiffDays / 365)} year(s) later.`;
      } else if (absDiffDays > 30) {
        return `Too early! Try ${Math.floor(absDiffDays / 30)} month(s) later.`;
      } else {
        return `Too early! Try ${absDiffDays} day(s) later.`;
      }
    }
  };

  const getScoreMessage = (score: number): string => {
    if (score === 0) return "Better luck next time! 🎭";
    if (score === 1) return "Phew! Made it by the skin of your teeth! 😅";
    if (score === 2) return "Not bad! You know your Phish! 🎵";
    if (score === 3) return "Nice work! You're getting good at this! 🎸";
    if (score === 4) return "Excellent! True phan status! 🌟";
    if (score === 5) return "PERFECT! You're a Phish wizard! 🧙‍♂️✨";
    return "Great job!";
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleSliderGuess = () => {
    const selectedDate = getDateFromSliderValue(selectedDateValue[0]);
    if (selectedDate) {
      submitGuess(selectedDate);
    }
  };

  const handleManualGuess = () => {
    if (manualDateInput.trim()) {
      submitGuess(manualDateInput.trim());
      setManualDateInput("");
    }
  };

  // Load a show on component mount
  useEffect(() => {
    loadRandomShow();
  }, []);

  if (gameState.isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
            <p>Loading a random Phish show...</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert className="mb-6">
          <AlertDescription>
            Error: {gameState.error}
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Button onClick={loadRandomShow}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!gameState.currentShow) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">
          <p>No show loaded</p>
          <Button onClick={loadRandomShow}>Load Show</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🎭 Phish Date Guessing Game</h1>
        <p className="text-muted-foreground">
          Can you guess the date of this show from the setlist? You have {maxGuesses} tries!
        </p>
      </div>

      {/* Game Progress */}
      <div className="text-center">
        <Badge variant="outline" className="text-sm">
          Guess {gameState.guesses.length + 1} of {maxGuesses}
        </Badge>
      </div>

      {/* Setlist Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Setlist
          </CardTitle>
          <CardDescription>
            This is the setlist from a Phish show. Can you guess when it was performed?
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gameState.currentShow.setlist && gameState.currentShow.setlist.length > 0 ? (
            <div className="space-y-4">
              {/* Group songs by set */}
              {gameState.currentShow.setlist && Array.from(new Set(gameState.currentShow.setlist.map(song => song.set)))
                .sort()
                .map(setName => (
                  <div key={setName} className="space-y-2">
                    <h3 className="font-semibold text-lg border-b pb-1">
                      {setName === 'S' ? 'Soundcheck' : 
                       setName === 'E' ? 'Encore' : 
                       setName === 'E2' ? 'Encore 2' : 
                       setName === 'E3' ? 'Encore 3' : 
                       `Set ${setName}`}
                    </h3>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {gameState.currentShow?.setlist
                        ?.filter(song => song.set === setName)
                        .sort((a, b) => a.position - b.position)
                        .map((song, index) => {
                          const setlistForSet = gameState.currentShow?.setlist?.filter(s => s.set === setName) || [];
                          return (
                            <div
                              key={`${song.uniqueid}-${index}`}
                              className="inline-flex items-center"
                            >
                              <Badge variant="secondary" className="text-xs">
                                {song.song}
                                {song.isjam === 1 && " ->"}
                              </Badge>
                              {song.transition === 1 && index < setlistForSet.length - 1 && (
                                <span className="mx-1 text-muted-foreground">→</span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No setlist available for this show.</p>
          )}
        </CardContent>
      </Card>

      {/* Date Input Methods */}
      {!gameState.gameOver && (
        <Card>
          <CardHeader>
            <CardTitle>Make Your Guess</CardTitle>
            <CardDescription>
              Choose a date using the slider (based on actual Phish show dates) or enter manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Slider Method */}
            {allShowDates.length > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Select from Phish show dates:
                  </label>
                  <div className="space-y-2">
                    <Slider
                      value={selectedDateValue}
                      onValueChange={setSelectedDateValue}
                      max={allShowDates.length - 1}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      Selected: {formatDate(getDateFromSliderValue(selectedDateValue[0]))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatDate(allShowDates[0])}</span>
                      <span>{formatDate(allShowDates[allShowDates.length - 1])}</span>
                    </div>
                  </div>
                </div>
                <Button onClick={handleSliderGuess} className="w-full">
                  Guess This Date
                </Button>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Manual Input Method */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Enter date manually (YYYY-MM-DD):
                </label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={manualDateInput}
                    onChange={(e) => setManualDateInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleManualGuess} disabled={!manualDateInput.trim()}>
                    Guess
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Guesses and Hints */}
      {gameState.guesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Guesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gameState.guesses.map((guess, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="font-mono">{formatDate(guess)}</span>
                  {index < gameState.hints.length && (
                    <span className="text-sm text-muted-foreground">{gameState.hints[index]}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Over Screen */}
      {gameState.gameOver && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                {gameState.score! > 0 ? (
                  <>
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Congratulations!
                  </>
                ) : (
                  <>
                    <Calendar className="h-6 w-6" />
                    Game Over
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <div className="text-2xl font-bold mb-2">
                  The correct date was: {formatDate(gameState.currentShow.showdate)}
                </div>
                <div className="text-lg mb-2">
                  Your score: {gameState.score}/{maxGuesses}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getScoreMessage(gameState.score!)}
                </div>
              </div>

              {/* Enhanced Show Details */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold mb-3 text-center">🎪 Show Details</h3>
                <div className="space-y-3">
                  {/* Venue and Location */}
                  <div className="text-center space-y-1">
                    {gameState.currentShow.venue && (
                      <div className="text-lg font-semibold">{gameState.currentShow.venue}</div>
                    )}
                    <div className="text-muted-foreground">
                      {gameState.currentShow.city && gameState.currentShow.state 
                        ? `${gameState.currentShow.city}, ${gameState.currentShow.state}`
                        : gameState.currentShow.location
                      }
                    </div>
                  </div>

                  {/* Tour Information */}
                  {gameState.currentShow.tour_name && (
                    <div className="text-center">
                      <Badge variant="outline">
                        Tour: {gameState.currentShow.tour_name}
                      </Badge>
                    </div>
                  )}

                  {/* Rating */}
                  {gameState.currentShow.rating > 0 && (
                    <div className="text-center">
                      <Badge variant="secondary">
                        Rating: {gameState.currentShow.rating.toFixed(1)}/5
                      </Badge>
                    </div>
                  )}

                  {/* Setlist Notes */}
                  {gameState.currentShow.setlist_notes && (
                    <div className="text-left">
                      <h4 className="font-medium text-sm mb-2">Show Notes:</h4>
                      <div 
                        className="text-xs text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: gameState.currentShow.setlist_notes.replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&ndash;/g, '–')
                        }}
                      />
                    </div>
                  )}

                  {/* Show ID for debugging */}
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Show ID: {gameState.currentShow.showid}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={loadRandomShow} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Play Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DateGuessGame;
