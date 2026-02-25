"""
dnn_model.py
------------
Dense Neural Network architecture for static SLSL alphabet recognition (A-Z).

Architecture:
    Input(63)
    → Dense(256, ReLU) → BatchNorm → Dropout(0.3)
    → Dense(128, ReLU) → BatchNorm → Dropout(0.2)
    → Dense(64,  ReLU)
    → Dense(26,  Softmax)

Input shape : (63,)   — 21 landmarks × 3 coordinates (x, y, z)
Output shape: (26,)   — probability distribution over A-Z
"""

import tensorflow as tf
from tensorflow.keras import layers, Model, regularizers


def build_dnn_model(
    input_dim: int = 63,
    num_classes: int = 26,
    l2_reg: float = 1e-4,
) -> Model:
    """
    Build and compile the DNN model for static sign classification.

    Args:
        input_dim:   Number of input features (default 63 = 21 × 3).
        num_classes: Number of output classes  (default 26 for A-Z).
        l2_reg:      L2 regularisation strength.

    Returns:
        Compiled tf.keras.Model ready for training.
    """
    reg = regularizers.l2(l2_reg)

    inputs = tf.keras.Input(shape=(input_dim,), name="keypoints")

    # ── Block 1 ──────────────────────────────────────────────
    x = layers.Dense(256, kernel_regularizer=reg, name="dense_1")(inputs)
    x = layers.BatchNormalization(name="bn_1")(x)
    x = layers.Activation("relu", name="relu_1")(x)
    x = layers.Dropout(0.3, name="drop_1")(x)

    # ── Block 2 ──────────────────────────────────────────────
    x = layers.Dense(128, kernel_regularizer=reg, name="dense_2")(x)
    x = layers.BatchNormalization(name="bn_2")(x)
    x = layers.Activation("relu", name="relu_2")(x)
    x = layers.Dropout(0.2, name="drop_2")(x)

    # ── Block 3 ──────────────────────────────────────────────
    x = layers.Dense(64, kernel_regularizer=reg, name="dense_3")(x)
    x = layers.BatchNormalization(name="bn_3")(x)
    x = layers.Activation("relu", name="relu_3")(x)

    # ── Output ────────────────────────────────────────────────
    outputs = layers.Dense(
        num_classes, activation="softmax", name="output"
    )(x)

    model = Model(inputs=inputs, outputs=outputs, name="SLSL_DNN")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model


if __name__ == "__main__":
    # Quick smoke test
    model = build_dnn_model()
    model.summary()

    # Test with dummy data
    import numpy as np
    dummy = np.random.rand(4, 63).astype(np.float32)
    preds = model.predict(dummy, verbose=0)
    print(f"\nOutput shape: {preds.shape}")   # (4, 26)
    print(f"Sum of probs: {preds.sum(axis=1)}")  # all ≈ 1.0
