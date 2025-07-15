# Analyse Vidéo On-Device avec Expo Modules

## Objectif

L'objectif principal de cette initiative est de déplacer la logique d'analyse vidéo, actuellement gérée côté backend (via Gemini), directement sur l'appareil mobile de l'utilisateur. Cela permettra de réduire les coûts d'infrastructure, d'améliorer la réactivité de l'application et d'offrir une meilleure expérience utilisateur en tirant parti des capacités de traitement on-device, notamment via l'intégration du modèle HuggingSnap.

Nous visons à obtenir les métadonnées nécessaires pour les vidéos (titre, description, tags, séquençage si possible) directement après l'upload par l'utilisateur, sans passer par un service cloud externe pour l'analyse.

## Plan d'Action

Voici les étapes clés pour intégrer l'analyse vidéo on-device :

1.  **Création d'un Module Natif Expo Local** :
    *   Nous allons générer un nouveau module natif Expo directement dans le projet mobile. Ce module servira de pont entre le code JavaScript/TypeScript de l'application et le code natif Swift qui effectuera l'analyse.
    *   Ce module sera configuré pour iOS dans un premier temps, en se basant sur les exemples et la documentation d'Expo Modules.

2.  **Intégration de la Logique d'Analyse de `HuggingSnap`** :
    *   Les fichiers Swift pertinents de l'application démo `HuggingSnap` (notamment ceux liés à l'évaluation des modèles de langage visuels - VLM) seront copiés et adaptés dans le répertoire iOS du nouveau module Expo.
    *   Les dépendances natives (comme MLX, MLXVLM) utilisées par `HuggingSnap` devront être correctement déclarées et gérées via le fichier `.podspec` du module Expo pour assurer leur intégration et compilation.

3.  **Exposition d'une API Simple via le Module Natif** :
    *   Le module natif exposera une fonction asynchrone simple (par exemple, `analyzeVideo(videoUri: String)`) accessible depuis JavaScript.
    *   Cette fonction prendra en entrée l'URI locale de la vidéo à analyser, déclenchera la logique d'analyse on-device, et retournera un objet JSON contenant les métadonnées extraites (titre, description, tags, etc.).

4.  **Mise à Jour du Composant `VideoUploader.tsx`** :
    *   Le composant `VideoUploader.tsx` sera modifié pour appeler la nouvelle fonction `analyzeVideo` du module natif après la sélection d'une vidéo par l'utilisateur.
    *   Le processus d'upload vers S3 et l'appel au backend pour l'analyse seront remplacés par cet appel direct au module natif.
    *   Les résultats de l'analyse on-device seront ensuite traités par les fonctions existantes (`handleAnalysisComplete`, `handleError`) pour mettre à jour l'interface utilisateur et la base de données.

## Fichiers Natifs Importants et leur Rôle

Pour comprendre le code natif et notre objectif, voici une explication des fichiers clés de `HuggingSnap` et de la structure d'un module Expo :

### Fichiers de `HuggingSnap` (Référence)

*   **`HuggingSnapApp.swift`** : Le point d'entrée principal de l'application SwiftUI. Il initialise l'environnement et la `ContentView`.
*   **`ContentView.swift`** : La vue principale de l'application. Elle gère l'affichage de la caméra, des vidéos/images importées, et interagit avec le `ContentViewModel` et le `VLMEvaluator`.
*   **`Camera/CameraManager.swift`** : Gère l'accès à la caméra, la capture de photos et l'enregistrement de vidéos. Il utilise `AVCaptureSession` pour configurer le flux vidéo et audio.
*   **`Camera/FrameManager.swift`** : Reçoit les `CMSampleBuffer` du `CameraManager` et les convertit en `CVPixelBuffer` pour un traitement ultérieur (par exemple, par le VLM).
*   **`VLMEvaluator.swift`** : **C'est le cœur de l'analyse on-device.** Ce fichier contient la logique pour charger et exécuter les modèles de langage visuels (VLM) de Hugging Face (comme SmolVLM2) sur l'appareil. Il gère l'inférence et la génération de texte à partir d'images ou de vidéos. C'est ce composant que nous allons intégrer dans notre module Expo.
*   **`Extensions/*.swift`** : Diverses extensions Swift qui fournissent des fonctionnalités utilitaires (par exemple, `CGImageExtension.swift` pour la conversion de `CVPixelBuffer` en `CGImage`, `Transferable.swift` pour la gestion des transferts de fichiers).
*   **`HuggingSnap.xcodeproj/project.pbxproj`** et **`HuggingSnap.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`** : Ces fichiers définissent les dépendances du projet Xcode, y compris les packages Swift (comme `mlx-swift-examples` qui contient MLX et MLXVLM) et leurs versions. Ces informations seront cruciales pour configurer les dépendances de notre module Expo.

### Structure d'un Module Expo (Cible)

*   **`ios/VideoAnalyzerModule.swift`** (ou un nom similaire) : Ce sera le fichier principal de notre module natif Expo. Il contiendra la définition du module (`ModuleDefinition`) et exposera les fonctions (`AsyncFunction`) qui seront appelables depuis JavaScript/TypeScript.
*   **`ios/Records.swift`** (ou un nom similaire) : Ce fichier définira les structures de données Swift (`Record`) qui seront utilisées pour typer les entrées et sorties des fonctions exposées par le module. Cela assure une forte typisation entre le code natif et le code JavaScript/TypeScript.
*   **`ios/Package.swift`** (ou un fichier de configuration similaire pour les dépendances Swift) : Ce fichier, ou une section équivalente dans le `.podspec` du module, listera les dépendances Swift nécessaires (MLX, MLXVLM) pour que le module puisse compiler et fonctionner.
*   **`VideoAnalyzerModule.ts`** (dans le répertoire du module Expo) : Le fichier de définition TypeScript pour le module. Il déclarera les interfaces et les types pour les fonctions et les événements exposés par le module natif, permettant une utilisation typée dans l'application React Native.
*   **`VideoAnalyzerModule.podspec`** (dans le répertoire du module Expo) : Le fichier de spécification CocoaPods pour le module. Il définira les sources des fichiers natifs, les dépendances (y compris les frameworks comme MLX et MLXVLM), et les configurations de compilation nécessaires pour le module iOS.

En suivant ce plan et en comprenant le rôle de ces fichiers, nous pourrons intégrer efficacement la logique d'analyse vidéo on-device dans votre application mobile.