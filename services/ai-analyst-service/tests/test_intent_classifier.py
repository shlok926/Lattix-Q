import pytest
from app.core.intent_classifier import IntentClassifier


class TestIntentClassifier:
    def setup_method(self):
        self.clf = IntentClassifier()

    def test_classifies_shor_explanation(self):
        assert self.clf.classify("How does Shor's algorithm work?") == "explain_attack"

    def test_classifies_report_interpretation(self):
        assert self.clf.classify("What does my report mean?") == "interpret_report"

    def test_classifies_migration(self):
        assert self.clf.classify("How do I migrate from RSA to Kyber?") == "migration_advice"

    def test_classifies_timeline(self):
        assert self.clf.classify("When will quantum computers break RSA?") == "timeline_question"

    def test_classifies_comparison(self):
        assert self.clf.classify("Kyber vs Dilithium — which is better?") == "compare_algorithms"

    def test_classifies_vulnerability(self):
        assert self.clf.classify("Is AES-128 safe against quantum?") == "assess_vulnerability"

    def test_defaults_to_general(self):
        assert self.clf.classify("Hello, can you help me?") == "general"
