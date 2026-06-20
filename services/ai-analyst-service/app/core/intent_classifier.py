from typing import Literal

Intent = Literal[
    "explain_attack", "assess_vulnerability", "compare_algorithms",
    "migration_advice", "interpret_report", "timeline_question", "general",
]

INTENT_RULES: list[tuple[list[str], Intent]] = [
    (["how does shor", "how does grover", "explain shor", "explain grover",
      "what is shor", "what is grover", "how does the attack", "quantum attack"],
     "explain_attack"),
    (["my report", "this report", "what does my report", "explain my results",
      "what does this mean", "interpret", "read my report", "my risk score"],
     "interpret_report"),
    (["when will", "how long", "years", "timeline", "how soon", "harvest",
      "decrypt later", "q-day", "quantum supremacy", "by 2030", "by 2035"],
     "timeline_question"),
    (["migrate", "migration", "how to switch", "replace", "transition",
      "should i use", "what should i use", "upgrade", "move to", "adopt"],
     "migration_advice"),
    (["compare", "vs ", "versus", "difference between", "better",
      "which is", "kyber vs", "dilithium vs", "rsa vs", "faster"],
     "compare_algorithms"),
    (["safe", "secure", "vulnerable", "at risk", "broken",
      "can be hacked", "how risky", "risk level", "how many qubits"],
     "assess_vulnerability"),
]

class IntentClassifier:
    def classify(self, user_message: str) -> Intent:
        message_lower = user_message.lower()
        for keywords, intent in INTENT_RULES:
            if any(kw in message_lower for kw in keywords):
                return intent
        return "general"
