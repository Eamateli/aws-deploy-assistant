import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../core/Card';
import { Button } from '../core/Button';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Clock, 
  Users, 
  Presentation,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { demoScript, getDemoSection, getNextSlide } from '../../data/demoScript';
import DemoWorkflow from './DemoWorkflow';
import GuidedTour from './GuidedTour';

const DemoPresentation = ({ mode = 'presenter', onComplete }) => {
  const [currentSection, setCurrentSection] = useState('introduction');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showNotes, setShowNotes] = useState(true);
  const [demoMode, setDemoMode] = useState('presentation'); // 'presentation', 'interactive', 'tour'
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const currentSectionData = getDemoSection(currentSection);
  const currentSlideData = currentSectionData?.slides[currentSlide];

  // Timer management
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = Date.now() - elapsedTime;
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, elapsedTime]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    const next = getNextSlide(currentSection, currentSlide);
    if (next) {
      setCurrentSection(next.sectionId);
      setCurrentSlide(next.slideIndex);
    } else {
      // End of presentation
      setIsPlaying(false);
      if (onComplete) onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      // Go to previous section
      const currentSectionIndex = demoScript.sections.findIndex(s => s.id === currentSection);
      if (currentSectionIndex > 0) {
        const prevSection = demoScript.sections[currentSectionIndex - 1];
        setCurrentSection(prevSection.id);
        setCurrentSlide(prevSection.slides.length - 1);
      }
    }
  };

  const handleSectionJump = (sectionId) => {
    setCurrentSection(sectionId);
    setCurrentSlide(0);
  };

  const getProgressPercentage = () => {
    const totalSlides = demoScript.sections.reduce((acc, section) => acc + section.slides.length, 0);
    const currentSlideNumber = demoScript.sections
      .slice(0, demoScript.sections.findIndex(s => s.id === currentSection))
      .reduce((acc, section) => acc + section.slides.length, 0) + currentSlide + 1;
    
    return (currentSlideNumber / totalSlides) * 100;
  };

  if (demoMode === 'interactive') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AWS Deploy Assistant - Interactive Demo
            </h1>
            <Button 
              onClick={() => setDemoMode('presentation')}
              variant="secondary"
            >
              Switch to Presentation Mode
            </Button>
          </div>
          <DemoWorkflow onComplete={onComplete} />
        </div>
      </div>
    );
  }

  if (demoMode === 'tour') {
    return (
      <GuidedTour 
        onComplete={onComplete}
        onClose={() => setDemoMode('presentation')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Presenter Controls */}
      <div className="fixed top-4 left-4 right-4 z-50">
        <Card className="bg-gray-800 border-gray-700">
          <div className="flex items-center justify-between">
            {/* Timer and Progress */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-mono">
                  {formatTime(elapsedTime)} / {demoScript.metadata.totalDuration}
                </span>
              </div>
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center space-x-2">
              <Button onClick={handlePrevious} size="sm" variant="secondary">
                <SkipBack className="w-4 h-4" />
              </Button>
              
              {!isPlaying ? (
                <Button onClick={handlePlay} size="sm">
                  <Play className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handlePause} size="sm" variant="secondary">
                  <Pause className="w-4 h-4" />
                </Button>
              )}
              
              <Button onClick={handleNext} size="sm" variant="secondary">
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setDemoMode('interactive')}
                size="sm"
                variant="secondary"
              >
                <Users className="w-4 h-4 mr-1" />
                Interactive
              </Button>
              <Button 
                onClick={() => setDemoMode('tour')}
                size="sm"
                variant="secondary"
              >
                <Presentation className="w-4 h-4 mr-1" />
                Tour
              </Button>
              <Button 
                onClick={() => setShowNotes(!showNotes)}
                size="sm"
                variant={showNotes ? "primary" : "secondary"}
              >
                Notes
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="pt-24 pb-8 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-8">
            {/* Main Slide Content */}
            <div className="col-span-8">
              <Card className="bg-white text-gray-900 min-h-96">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">
                    {currentSlideData?.content || currentSectionData?.title}
                  </h1>
                  
                  {currentSlideData?.script && (
                    <div className="text-lg text-gray-700 mb-6 max-w-4xl mx-auto">
                      <p className="leading-relaxed">
                        {currentSlideData.script.replace(/"/g, '')}
                      </p>
                    </div>
                  )}

                  {currentSlideData?.actions && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Demo Actions:</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {currentSlideData.actions.map((action, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentSlideData?.timing && (
                    <div className="text-sm text-gray-500 mb-4">
                      Timing: {currentSlideData.timing}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="col-span-4 space-y-4">
              {/* Section Navigation */}
              <Card className="bg-gray-800 border-gray-700">
                <h3 className="font-semibold mb-3 text-white">Sections</h3>
                <div className="space-y-2">
                  {demoScript.sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionJump(section.id)}
                      className={`
                        w-full text-left px-3 py-2 rounded text-sm transition-colors
                        ${section.id === currentSection 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-700'
                        }
                      `}
                    >
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs opacity-75">{section.duration}</div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Speaker Notes */}
              {showNotes && currentSlideData?.notes && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Speaker Notes</h4>
                      <p className="text-sm text-yellow-700">
                        {currentSlideData.notes}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Demo Scenarios */}
              <Card className="bg-gray-800 border-gray-700">
                <h3 className="font-semibold mb-3 text-white">Demo Scenarios</h3>
                <div className="space-y-2">
                  {demoScript.demoScenarios.map((scenario, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium text-gray-200">{scenario.name}</div>
                      <div className="text-gray-400 text-xs">{scenario.expectedOutcome}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPresentation;