import { PlanIdentifier, UserUsage } from "editia-core";
import { VideoType } from "../types/video.types";
import { VIDEO_DURATION_FACTOR } from "../constants/video";


export class ScriptService {
    static validateScript({script, plan, userUsage, videos}: {script: string, plan: PlanIdentifier, userUsage: UserUsage, videos: VideoType[]} ): {isValid: boolean, warnings: string[]} {
        // For free plan users only have 1 video with watermark that is 30 seconds max
        // For creator plan users have 15 videos that is 60 seconds max
        // For pro plan users have 100 videos that is 120 seconds max

        // Total videos duration should be equal or greater than the script duration
        const { estimatedDuration } = this.calculateScriptDuration(script);
        const durationWithTolerance = this.applyFivePercentTolerance(estimatedDuration);
        const isScriptDurationValid = this.validateScriptDuration(script, plan, userUsage);
        const warning = [];
        if (videos.length === 0) {
            warning.push('Aucune vidéo sélectionnée');
        } 
        const isMinimumDurationValid = this.validateVideoMinimumDuration(videos);
        if (!isMinimumDurationValid) {
            warning.push('Les vidéos doivent avoir une durée minimale de 3 secondes.');
        }
        if (!isScriptDurationValid) {
            warning.push('La durée du script est trop longue. Elle doit être inférieure à 30 secondes pour le plan gratuit, 60 secondes pour le plan créateur et 120 secondes pour le plan pro.');
        }
        
        const totalVideosDuration = this.validateVideoDuration(videos);
        console.log('videoDuration', totalVideosDuration, durationWithTolerance, isScriptDurationValid, totalVideosDuration < durationWithTolerance);
        if (totalVideosDuration < durationWithTolerance) {
            warning.push('La durée totale des vidéos est inférieure à la durée du script. Elle doit être supérieure à la durée du script.');
        }
        return {isValid: warning.length === 0, warnings: warning};
    }

    static calculateScriptDuration(script: string) {
        const words = script.split(" ").length;
        const   estimatedDuration= Math.round(words * VIDEO_DURATION_FACTOR) 
        return {
            wordCount: words,
            estimatedDuration
        }
    }

    static validateVideoDuration(videos: VideoType[]) {
        const totalVideosDuration =videos.reduce((acc, video) => acc + (video.duration_seconds || 0), 0);
        return totalVideosDuration;
    }
    static validateVideoMinimumDuration(videos: VideoType[]) {
       // Every video should have a minimum duration of 3 seconds
       const isMinimumDurationValid = videos.every((video) => video.duration_seconds && video.duration_seconds >= 3);
       if (!isMinimumDurationValid) {
        return false;
       }
       return true;
    }

    static validateScriptDuration(script: string, plan: PlanIdentifier, userUsage: UserUsage ) {
        const { estimatedDuration } = this.calculateScriptDuration(script);
        const durationWithTolerance = this.applyFivePercentTolerance(estimatedDuration);
        switch (plan) {
            case 'free':
                if (durationWithTolerance > 30) {
                    return false;
                }
                break;
            case 'creator':
                if (durationWithTolerance > 60) {
                    return false;
                }
                break;
            case 'pro':
                if (durationWithTolerance > 120) {
                    return false;
                }
                break;
            default:
                return true;
        }
        return true;
    }

    static applyFivePercentTolerance(duration: number) {
        return Math.round(duration * 1.05);
    }
}